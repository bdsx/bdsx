import { events } from "../event";
import { NetworkIdentifier } from "./networkidentifier";
import { MinecraftPacketIds } from "./packetids";
import { ModalFormRequestPacket, SetTitlePacket } from "./packets";

const formMaps = new Map<number, SentForm>();

// rua.kr: I could not find the internal form id counter, It seems BDS does not use the form.
//         But I set the minimum for the unexpected situation.
const MINIMUM_FORM_ID = 0x10000000;
const MAXIMUM_FORM_ID = 0x7fffffff; // 32bit signed integer maximum
const FORM_TIMEOUT = 1000 * 60 * 10; // 10min. deleting timeout if the form response is too late.

let formIdCounter = MINIMUM_FORM_ID;

class SentForm {
    public readonly id: number;
    public readonly timeout: NodeJS.Timeout;

    constructor(
        public readonly networkIdentifier: NetworkIdentifier,
        public readonly resolve: (data: FormResponse<any> | PromiseLike<FormResponse<any>>) => void,
        public readonly reject: (err: unknown) => void,
        public readonly formOption: Form.Options,
    ) {
        // allocate id without duplication
        for (;;) {
            const id = formIdCounter++;
            if (formIdCounter >= MAXIMUM_FORM_ID) formIdCounter = MINIMUM_FORM_ID;

            // logically it will enter the infinity loop when it fulled. but technically it will crash by out of memory before
            if (!formMaps.has(id)) {
                formMaps.set(id, this);
                this.id = id;
                break;
            }
        }

        this.timeout = setTimeout(() => {
            formMaps.delete(this.id);
            this.reject(Error("form timeout"));
        }, FORM_TIMEOUT);
    }
}

events.serverStop.on(() => {
    for (const form of formMaps.values()) {
        form.reject(Error("server closed"));
        clearTimeout(form.timeout);
    }
    formMaps.clear();
});

export interface FormItemButton {
    text: string;
    image?: {
        type: "path" | "url";
        data: string;
    };
}

export interface FormItemLabel {
    type: "label";
    text: string;
    image?: {
        type: "path" | "url";
        data: string;
    };
}

export interface FormItemToggle {
    type: "toggle";
    text: string;
    default?: boolean;
}

export interface FormItemSlider {
    type: "slider";
    text: string;
    min: number;
    max: number;
    step?: number;
    default?: number;
}

export interface FormItemStepSlider {
    type: "step_slider";
    text: string;
    steps: string[];
    default?: number;
}

export interface FormItemDropdown {
    type: "dropdown";
    text: string;
    options: string[];
    default?: number;
}

export interface FormItemInput {
    type: "input";
    text: string;
    placeholder?: string;
    default?: string;
}

export type FormItem = FormItemLabel | FormItemToggle | FormItemSlider | FormItemStepSlider | FormItemDropdown | FormItemInput;

export type FormResponse<T extends FormData["type"]> = T extends "form"
    ? number | null
    : T extends "modal"
    ? boolean
    : T extends "custom_form"
    ? any[] | null
    : never;

export interface FormDataSimple {
    type: "form";
    title: string;
    content: string;
    buttons: FormItemButton[];
}
export interface FormDataModal {
    type: "modal";
    title: string;
    content: string;
    button1: string;
    button2: string;
}
export interface FormDataCustom {
    type: "custom_form";
    title: string;
    content: FormItem[];
}
export type FormData = FormDataSimple | FormDataModal | FormDataCustom;

export class FormButton {
    text: string;
    image: {
        type: "path" | "url";
        data: string;
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

export class FormLabel extends FormComponent implements FormItemLabel {
    readonly type = "label";
    constructor(text: string) {
        super(text);
    }
}

export class FormToggle extends FormComponent implements FormItemToggle {
    readonly type = "toggle";
    default: boolean;
    constructor(text: string, defaultValue?: boolean) {
        super(text);
        if (defaultValue) this.default = defaultValue;
    }
}

export class FormSlider extends FormComponent implements FormItemSlider {
    readonly type = "slider";
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

export class FormStepSlider extends FormComponent implements FormItemStepSlider {
    readonly type = "step_slider";
    steps: string[];
    default: number;
    constructor(text: string, steps: string[], defaultIndex?: number) {
        super(text);
        this.steps = steps;
        if (defaultIndex) this.default = defaultIndex;
    }
}

export class FormDropdown extends FormComponent implements FormItemDropdown {
    readonly type = "dropdown";
    options: string[];
    default: number;
    constructor(text: string, options: string[], defaultIndex?: number) {
        super(text);
        this.options = options;
        if (defaultIndex) this.default = defaultIndex;
    }
}

export class FormInput extends FormComponent implements FormItemInput {
    readonly type = "input";
    placeholder: string;
    default: string;
    constructor(text: string, placeholder?: string, defaultValue?: string) {
        super(text);
        if (placeholder) this.placeholder = placeholder;
        if (defaultValue) this.default = defaultValue;
    }
}

export class Form<DATA extends FormData> {
    labels: Map<number, string> = new Map<number, string>();
    response: any;

    constructor(public data: DATA) {}

    static sendTo<T extends FormData["type"]>(target: NetworkIdentifier, data: FormData & { type: T }, opts?: Form.Options): Promise<FormResponse<T>> {
        return new Promise<FormResponse<T>>((resolve, reject) => {
            const submitted = new SentForm(target, resolve, reject, opts || {});
            const pk = ModalFormRequestPacket.allocate();
            pk.id = submitted.id;
            if (opts != null) opts.id = pk.id;
            pk.content = JSON.stringify(data);
            pk.sendTo(target);
            pk.dispose();

            const formdata: FormData = data;
            if (formdata.type === "form") {
                if (formdata.buttons != null) {
                    for (const button of formdata.buttons) {
                        if (button.image?.type === "url") {
                            setTimeout(() => {
                                const pk = SetTitlePacket.allocate();
                                pk.sendTo(target);
                                pk.dispose();
                            }, 1000);
                            break;
                        }
                    }
                }
            }
        });
    }

    sendTo(target: NetworkIdentifier, callback?: (form: Form<DATA>, networkIdentifier: NetworkIdentifier) => any): number {
        const opts: Form.Options = {};
        Form.sendTo(target, this.data, opts).then(res => {
            if (callback == null) return;
            switch (this.data.type) {
                case "form":
                    this.response = this.labels.get(res as any) || res;
                    break;
                case "modal":
                    this.response = res;
                    break;
                case "custom_form":
                    this.response = res;
                    if (res !== null) {
                        for (const [index, label] of this.labels) {
                            (res as any)[label] = (res as any)[index];
                        }
                    }
                    break;
            }
            callback(this, target);
        });
        return opts.id!;
    }

    toJSON(): FormData {
        return this.data;
    }
}

export namespace Form {
    export interface Options {
        /**
         * a field for the output.
         * this function will record the id to it
         */
        id?: number;
        cancelationReason?: number;
    }
    /**
     * @reference https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-ui/formresponse#cancelationreason
     */
    export enum CancelationReason {
        userClosed,
        userBusy,
    }
}

export class SimpleForm extends Form<FormDataSimple> {
    constructor(title = "", content = "", buttons: FormButton[] = []) {
        super({
            type: "form",
            title,
            content,
            buttons,
        });
    }

    getTitle(): string {
        return this.data.title;
    }

    setTitle(title: string): SimpleForm {
        this.data.title = title;
        return this;
    }

    getContent(): string {
        return this.data.content;
    }

    setContent(content: string): SimpleForm {
        this.data.content = content;
        return this;
    }

    addButton(button: FormButton, label?: string): SimpleForm {
        this.data.buttons!.push(button);
        if (label) this.labels.set(this.data.buttons!.length - 1, label);
        return this;
    }

    getButton(indexOrLabel: string | number): FormButton | null {
        if (typeof indexOrLabel === "string") {
            for (const [index, label] of this.labels) {
                if (label === indexOrLabel) return this.data.buttons![index] as FormButton;
            }
        } else {
            return this.data.buttons![indexOrLabel] as FormButton;
        }
        return null;
    }
}

export class ModalForm extends Form<FormDataModal> {
    constructor(title = "", content = "") {
        super({
            type: "modal",
            title,
            content,
            button1: "",
            button2: "",
        });
    }

    getTitle(): string {
        return this.data.title;
    }

    setTitle(title: string): ModalForm {
        this.data.title = title;
        return this;
    }

    getContent(): string {
        return this.data.content as string;
    }

    setContent(content: string): ModalForm {
        this.data.content = content;
        return this;
    }

    getButtonConfirm(): string {
        return this.data.button1;
    }

    setButtonConfirm(text: string): ModalForm {
        this.data.button1 = text;
        return this;
    }

    getButtonCancel(): string {
        return this.data.button2;
    }

    setButtonCancel(text: string): ModalForm {
        this.data.button2 = text;
        return this;
    }
}

export class CustomForm extends Form<FormDataCustom> {
    constructor(title = "", content: FormComponent[] = []) {
        super({
            type: "custom_form",
            title,
            content: content as FormItem[],
        });
    }

    getTitle(): string {
        return this.data.title;
    }

    setTitle(title: string): CustomForm {
        this.data.title = title;
        return this;
    }

    addComponent(component: FormComponent, label?: string): CustomForm {
        (this.data.content as FormComponent[]).push(component);
        if (label) this.labels.set(this.data.content!.length - 1, label);
        return this;
    }

    getComponent(indexOrLabel: string | number): FormComponent | null {
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

events.packetAfter(MinecraftPacketIds.ModalFormResponse).on((pk, ni) => {
    const sent = formMaps.get(pk.id);
    if (sent == null) return;
    if (sent.networkIdentifier !== ni) return; // other user is responding
    formMaps.delete(pk.id);
    sent.formOption.cancelationReason = pk.cancelationReason.value();
    const result = pk.response.value();
    sent.resolve(result == null ? null : result.value());
    clearTimeout(sent.timeout);
});
