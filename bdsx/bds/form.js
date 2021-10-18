"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomForm = exports.ModalForm = exports.SimpleForm = exports.Form = exports.FormInput = exports.FormDropdown = exports.FormStepSlider = exports.FormSlider = exports.FormToggle = exports.FormLabel = exports.FormButton = void 0;
const event_1 = require("../event");
const minecraft_1 = require("../minecraft");
const formMaps = new Map();
// rua.kr: I could not find the internal form id counter, It seems BDS does not use the form.
//         But I set the minimum for the unexpected situation.
const MINIMUM_FORM_ID = 0x10000000;
const MAXIMUM_FORM_ID = 0x7fffffff; // 32bit signed integer maximum
let formIdCounter = MINIMUM_FORM_ID;
class SentForm {
    constructor(networkIdentifier, resolve, reject) {
        this.networkIdentifier = networkIdentifier;
        this.resolve = resolve;
        this.reject = reject;
        this.networkIdentifier = networkIdentifier;
        // allocate id without dupication
        for (;;) {
            const id = formIdCounter++;
            if (formIdCounter >= MAXIMUM_FORM_ID)
                formIdCounter = MINIMUM_FORM_ID;
            // logically it will enter the infinity loop when it fulled. but technically it will crash by out of memory before
            if (!formMaps.has(id)) {
                formMaps.set(id, this);
                this.id = id;
                break;
            }
        }
    }
}
class FormButton {
    constructor(text, imageType, imagePath = "") {
        this.text = text;
        if (imageType) {
            this.image = {
                type: imageType,
                data: imagePath,
            };
        }
    }
}
exports.FormButton = FormButton;
class FormComponent {
    constructor(text) {
        this.text = text;
    }
}
class FormLabel extends FormComponent {
    constructor(text) {
        super(text);
        this.type = "label";
    }
}
exports.FormLabel = FormLabel;
class FormToggle extends FormComponent {
    constructor(text, defaultValue) {
        super(text);
        this.type = "toggle";
        if (defaultValue != null)
            this.default = defaultValue;
    }
}
exports.FormToggle = FormToggle;
class FormSlider extends FormComponent {
    constructor(text, min, max, step, defaultValue) {
        super(text);
        this.type = "slider";
        this.min = min;
        this.max = max;
        if (step != null)
            this.step = step;
        if (defaultValue != null)
            this.default = defaultValue;
    }
}
exports.FormSlider = FormSlider;
class FormStepSlider extends FormComponent {
    constructor(text, steps, defaultIndex) {
        super(text);
        this.type = "step_slider";
        this.steps = steps;
        if (defaultIndex != null)
            this.default = defaultIndex;
    }
}
exports.FormStepSlider = FormStepSlider;
class FormDropdown extends FormComponent {
    constructor(text, options, defaultIndex) {
        super(text);
        this.type = "dropdown";
        this.options = options;
        if (defaultIndex != null)
            this.default = defaultIndex;
    }
}
exports.FormDropdown = FormDropdown;
class FormInput extends FormComponent {
    constructor(text, placeholder, defaultValue) {
        super(text);
        this.type = "input";
        if (placeholder)
            this.placeholder = placeholder;
        if (defaultValue)
            this.default = defaultValue;
    }
}
exports.FormInput = FormInput;
class Form {
    constructor(data) {
        this.data = data;
        this.labels = new Map();
    }
    static sendTo(target, data, opts) {
        return new Promise((resolve, reject) => {
            var _a;
            const submitted = new SentForm(target, resolve, reject);
            const pk = minecraft_1.ModalFormRequestPacket.create();
            pk.id = submitted.id;
            if (opts != null)
                opts.id = pk.id;
            pk.content = JSON.stringify(data);
            pk.sendTo(target);
            pk.dispose();
            const formdata = data;
            if (formdata.type === 'form') {
                if (formdata.buttons != null) {
                    for (const button of formdata.buttons) {
                        if (((_a = button.image) === null || _a === void 0 ? void 0 : _a.type) === "url") {
                            setTimeout(() => {
                                const pk = minecraft_1.SetTitlePacket.create();
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
    sendTo(target, callback) {
        const opts = {};
        Form.sendTo(target, this.data, opts).then(res => {
            if (callback == null)
                return;
            switch (this.data.type) {
                case "form":
                    this.response = this.labels.get(res) || res;
                    break;
                case "modal":
                    this.response = res;
                    break;
                case "custom_form":
                    this.response = res;
                    if (res !== null) {
                        for (const [index, label] of this.labels) {
                            res[label] = res[index];
                        }
                    }
                    break;
            }
            callback(this, target);
        });
        return opts.id;
    }
    toJSON() {
        return this.data;
    }
}
exports.Form = Form;
class SimpleForm extends Form {
    constructor(title = "", content = "", buttons = []) {
        super({
            type: 'form',
            title,
            content,
            buttons
        });
    }
    getTitle() {
        return this.data.title;
    }
    setTitle(title) {
        this.data.title = title;
    }
    getContent() {
        return this.data.content;
    }
    setContent(content) {
        this.data.content = content;
    }
    addButton(button, label) {
        this.data.buttons.push(button);
        if (label)
            this.labels.set(this.data.buttons.length - 1, label);
    }
    getButton(indexOrLabel) {
        if (typeof indexOrLabel === "string") {
            for (const [index, label] of this.labels) {
                if (label === indexOrLabel)
                    return this.data.buttons[index];
            }
        }
        else {
            return this.data.buttons[indexOrLabel];
        }
        return null;
    }
}
exports.SimpleForm = SimpleForm;
class ModalForm extends Form {
    constructor(title = "", content = "") {
        super({
            type: 'modal',
            title,
            content,
            button1: '',
            button2: '',
        });
    }
    getTitle() {
        return this.data.title;
    }
    setTitle(title) {
        this.data.title = title;
    }
    getContent() {
        return this.data.content;
    }
    setContent(content) {
        this.data.content = content;
    }
    getButtonConfirm() {
        return this.data.button1;
    }
    setButtonConfirm(text) {
        this.data.button1 = text;
    }
    getButtonCancel() {
        return this.data.button2;
    }
    setButtonCancel(text) {
        this.data.button2 = text;
    }
}
exports.ModalForm = ModalForm;
class CustomForm extends Form {
    constructor(title = "", content = []) {
        super({
            type: 'custom_form',
            title,
            content: content
        });
    }
    getTitle() {
        return this.data.title;
    }
    setTitle(title) {
        this.data.title = title;
    }
    addComponent(component, label) {
        this.data.content.push(component);
        if (label)
            this.labels.set(this.data.content.length - 1, label);
    }
    getComponent(indexOrLabel) {
        if (typeof indexOrLabel === "string") {
            for (const [index, label] of this.labels) {
                if (label === indexOrLabel)
                    return this.data.content[index];
            }
        }
        else {
            return this.data.content[indexOrLabel];
        }
        return null;
    }
}
exports.CustomForm = CustomForm;
event_1.events.packetAfter(minecraft_1.MinecraftPacketIds.ModalFormResponse).on((pk, ni) => {
    const sent = formMaps.get(pk.id);
    if (sent == null)
        return;
    if (sent.networkIdentifier !== ni)
        return; // other user is responsing
    formMaps.delete(pk.id);
    try {
        const response = JSON.parse(pk.response);
        sent.resolve(response);
    }
    catch (err) {
        sent.reject(err);
    }
});
//# sourceMappingURL=form.js.map