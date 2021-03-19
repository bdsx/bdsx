import { MinecraftPacketIds, nethook, NetworkIdentifier } from "bdsx";
import { SetTitlePacket, ShowModalFormPacket } from "./packets";

const formMaps = new Map<number, Form>();

export interface FormData {
    type: "form" | "modal" | "custom_form",
    title: string,
    content: string | FormComponent[],
    buttons?: FormButton[],
    button1?: string,
    button2?: string,
}

export class FormButton {
    text: string;
    image: {
        type: "path" | "url",
        data: string,
    };
    constructor(text: string, imageType?: "path" | "url", imagePath: string = "") {
        this.text = text;
        if (imageType) {
            this.image = {
                type: imageType,
                data: imagePath,
            };
        }
    }
}

class FormComponent {
    text: string;
    type: string;
    constructor(text: string) {
        this.text = text;
    }
}

export class FormLabel extends FormComponent {
    type = "label";
    constructor(text: string) {
        super(text);
    }
}

export class FormToggle extends FormComponent {
    type = "toggle";
    default: boolean;
    constructor(text: string, defaultValue?: boolean) {
        super(text);
        if (defaultValue) this.default = defaultValue;
    }
}

export class FormSlider extends FormComponent {
    type = "slider";
    min: number;
    max: number;
    step: number;
    default: number;
    constructor(text: string, min: number, max: number, step?: number, defaultValue?: number) {
        super(text);
        this.min = min;
        this.max = max;
        if (step) this.step = step;
        if (defaultValue) this.default = defaultValue;
    }
}

export class FormStepSlider extends FormComponent {
    type = "step_slider";
    steps: string[];
    default: number;
    constructor(text: string, steps: string[], defaultIndex?: number) {
        super(text);
        this.steps = steps;
        if (defaultIndex) this.default = defaultIndex;
    }
}

export class FormDropdown extends FormComponent {
    type = "dropdown";
    options: string[];
    default: number;
    constructor(text: string, options: string[], defaultIndex?: number) {
        super(text);
        this.options = options;
        if (defaultIndex) this.default = defaultIndex;
    }
}

export class FormInput extends FormComponent {
    type = "input";
    placeholder: string;
    default: boolean;
    constructor(text: string, placeholder?: string, defaultValue?: boolean) {
        super(text);
        if (placeholder) this.placeholder = placeholder;
        if (defaultValue) this.default = defaultValue;
    }
}

class Form {
    protected externalLoading = false;
    data: FormData;
    labels: Map<number, string> = new Map<number, string>();
    id: number = -1;
    callback: CallableFunction | null = null;
    response: any;
    constructor() {
        this.data = {
            type: "form",
            title: "",
            content: "",
        };
    }
    sendTo(target:NetworkIdentifier, callback?: (form: Form, networkIdentifier: NetworkIdentifier) => any):number {
        this.id = Math.floor(Math.random() * 2147483647) + 1;
        this.callback = callback ?? null;
        const pk = ShowModalFormPacket.create();
        pk.id = this.id;
        pk.content = JSON.stringify(this);
        pk.sendTo(target);
        pk.dispose();
        formMaps.set(this.id, this);
        if (this.externalLoading) {
            setTimeout(() => {
                const pk = SetTitlePacket.create();
                pk.sendTo(target);
                pk.dispose();
            }, 100);
        }
        return this.id;
    }
    toJSON():FormData {
        return this.data;
    }
}

export class SimpleForm extends Form {
    constructor(title = "", content = "", buttons: FormButton[] = []) {
        super();
        this.data.type = "form";
        this.data.title = title;
        this.data.content = content;
        this.data.buttons = buttons;
        for (const button of buttons) {
            if (button.image?.type === "url") this.externalLoading = true;
        }
    }
    getTitle():string {
        return this.data.title;
    }
    setTitle(title:string):void {
        this.data.title = title;
    }
    getContent():string {
        return this.data.content as string;
    }
    setContent(content:string):void {
        this.data.content = content;
    }
    addButton(button: FormButton, label?: string):void {
        this.data.buttons!.push(button);
        if (button.image?.type === "url") this.externalLoading = true;
        if (label) this.labels.set(this.data.buttons!.length - 1, label);
    }
    getButton(indexOrLabel: string | number):FormButton | null {
        if (typeof indexOrLabel === "string") {
            for (const [index, label] of this.labels) {
                if (label === indexOrLabel) return this.data.buttons![index];
            }
        } else {
            return this.data.buttons![indexOrLabel];
        }
        return null;
    }
}

export class ModalForm extends Form {
    constructor(title = "", content = "") {
        super();
        this.data.type = "modal";
        this.data.title = title;
        this.data.content = content;
        this.data.button1 = "";
        this.data.button2 = "";
    }
    getTitle():string {
        return this.data.title;
    }
    setTitle(title:string):void {
        this.data.title = title;
    }
    getContent():string {
        return this.data.content as string;
    }
    setContent(content:string):void {
        this.data.content = content;
    }
    getButtonConfirm():string | null {
        return this.data.button1 ?? null;
    }
    setButtonConfirm(text:string):void {
        this.data.button1 = text;
    }
    getButtonCancel():string | null {
        return this.data.button2 ?? null;
    }
    setButtonCancel(text:string):void {
        this.data.button2 = text;
    }
}


export class CustomForm extends Form {
    constructor(title = "", content: FormComponent[] = []) {
        super();
        this.data.type = "custom_form";
        this.data.title = title;
        this.data.content = [];
    }
    getTitle():string {
        return this.data.title;
    }
    setTitle(title:string):void {
        this.data.title = title;
    }
    addComponent(component: FormComponent, label?: string):void {
        (this.data.content as FormComponent[]).push(component);
        if (label) this.labels.set(this.data.content!.length - 1, label);
    }
    getComponent(indexOrLabel: string | number):FormComponent | null {
        if (typeof indexOrLabel === "string") {
            for (const [index, label] of this.labels) {
                if (label === indexOrLabel) return (this.data.content as FormComponent[])[index];
            }
        } else {
            return (this.data.content as FormComponent[])[indexOrLabel];
        }
        return null;
    }
}

nethook.after(MinecraftPacketIds.ModalFormResponse).on((pk, ni) => {
    const form = formMaps.get(pk.id);
    const response = JSON.parse(pk.response);
    if (form?.callback) {
        switch (form.data.type) {
        case "form":
            form.response = form.labels.get(response) ?? response;
            form.callback(form, ni);
            break;
        case "modal":
            form.response = response;
            form.callback(form, ni);
            break;
        case "custom_form":
            if (response !== null) {
                for (const [index, label] of form.labels) {
                    response[label] = response[index];
                }
            }
            form.response = response;
            form.callback(form, ni);
            break;
        }
    }
    formMaps.delete(pk.id);
});
