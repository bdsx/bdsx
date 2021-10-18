import { NetworkIdentifier } from "../minecraft";
import { NetworkIdentifier as NetworkIdentifierLegacy } from "./networkidentifier";
export interface FormItemButton {
    text: string;
    image?: {
        type: "path" | "url";
        data: string;
    };
}
export interface FormItemLabel {
    type: 'label';
    text: string;
    image?: {
        type: "path" | "url";
        data: string;
    };
}
export interface FormItemToggle {
    type: 'toggle';
    text: string;
    default?: boolean;
}
export interface FormItemSlider {
    type: 'slider';
    text: string;
    min: number;
    max: number;
    step?: number;
    default?: number;
}
export interface FormItemStepSlider {
    type: 'step_slider';
    text: string;
    steps: string[];
    default?: number;
}
export interface FormItemDropdown {
    type: 'dropdown';
    text: string;
    options: string[];
    default?: number;
}
export interface FormItemInput {
    type: 'input';
    text: string;
    placeholder?: string;
    default?: string;
}
export declare type FormItem = FormItemLabel | FormItemToggle | FormItemSlider | FormItemStepSlider | FormItemDropdown | FormItemInput;
export declare type FormResponse<T extends FormData['type']> = T extends 'form' ? number | null : T extends 'modal' ? boolean : T extends 'custom_form' ? any[] | null : never;
export interface FormDataSimple {
    type: 'form';
    title: string;
    content: string;
    buttons: FormItemButton[];
}
export interface FormDataModal {
    type: 'modal';
    title: string;
    content: string;
    button1: string;
    button2: string;
}
export interface FormDataCustom {
    type: 'custom_form';
    title: string;
    content: FormItem[];
}
export declare type FormData = FormDataSimple | FormDataModal | FormDataCustom;
export declare class FormButton {
    text: string;
    image: {
        type: "path" | "url";
        data: string;
    };
    constructor(text: string, imageType?: "path" | "url", imagePath?: string);
}
declare class FormComponent {
    text: string;
    type: string;
    constructor(text: string);
}
export declare class FormLabel extends FormComponent implements FormItemLabel {
    readonly type = "label";
    constructor(text: string);
}
export declare class FormToggle extends FormComponent implements FormItemToggle {
    readonly type = "toggle";
    default: boolean;
    constructor(text: string, defaultValue?: boolean);
}
export declare class FormSlider extends FormComponent implements FormItemSlider {
    readonly type = "slider";
    min: number;
    max: number;
    step: number;
    default: number;
    constructor(text: string, min: number, max: number, step?: number, defaultValue?: number);
}
export declare class FormStepSlider extends FormComponent implements FormItemStepSlider {
    readonly type = "step_slider";
    steps: string[];
    default: number;
    constructor(text: string, steps: string[], defaultIndex?: number);
}
export declare class FormDropdown extends FormComponent implements FormItemDropdown {
    readonly type = "dropdown";
    options: string[];
    default: number;
    constructor(text: string, options: string[], defaultIndex?: number);
}
export declare class FormInput extends FormComponent implements FormItemInput {
    readonly type = "input";
    placeholder: string;
    default: string;
    constructor(text: string, placeholder?: string, defaultValue?: string);
}
export declare class Form<DATA extends FormData> {
    data: DATA;
    labels: Map<number, string>;
    response: any;
    constructor(data: DATA);
    static sendTo<T extends FormData['type']>(target: NetworkIdentifier | NetworkIdentifierLegacy, data: FormData & {
        type: T;
    }, opts?: Form.Options): Promise<FormResponse<T>>;
    sendTo<T extends NetworkIdentifier | NetworkIdentifierLegacy>(target: T, callback?: (form: Form<DATA>, networkIdentifier: T) => any): number;
    toJSON(): FormData;
}
export declare namespace Form {
    interface Options {
        /**
         * a field for the output.
         * this function will record the id to it
         */
        id?: number;
    }
}
export declare class SimpleForm extends Form<FormDataSimple> {
    constructor(title?: string, content?: string, buttons?: FormButton[]);
    getTitle(): string;
    setTitle(title: string): void;
    getContent(): string;
    setContent(content: string): void;
    addButton(button: FormButton, label?: string): void;
    getButton(indexOrLabel: string | number): FormButton | null;
}
export declare class ModalForm extends Form<FormDataModal> {
    constructor(title?: string, content?: string);
    getTitle(): string;
    setTitle(title: string): void;
    getContent(): string;
    setContent(content: string): void;
    getButtonConfirm(): string;
    setButtonConfirm(text: string): void;
    getButtonCancel(): string;
    setButtonCancel(text: string): void;
}
export declare class CustomForm extends Form<FormDataCustom> {
    constructor(title?: string, content?: FormComponent[]);
    getTitle(): string;
    setTitle(title: string): void;
    addComponent(component: FormComponent, label?: string): void;
    getComponent(indexOrLabel: string | number): FormComponent | null;
}
export {};
