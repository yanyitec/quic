/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
var Quic;
(function (Quic) {
    class TextBuilder {
        constructor() { }
        //只是可见，没有input元素跟着
        visible(view) {
            let element = Quic.dom.createElement("span");
            //element.innerHTML = value===undefined||value===null?"":value;
            return element;
        }
        //隐藏，但是有input元素
        hidden(view) {
            let element = Quic.dom.createElement("input");
            element.type = "hidden";
            element.name = view.name;
            return element;
        }
        //只读，不能修改，但是有input元素
        readonly(view) {
            let element = Quic.dom.createElement("input");
            element.type = "text";
            element.readOnly = true;
            element.name = view.name;
            return element;
        }
        // 可编辑
        editable(view) {
            let element = Quic.dom.createElement("input");
            element.type = "text";
            element.name = view.name;
            return element;
        }
        // 设置View的值，并让view反映该值。
        setValue(view, value) {
            let element = view.element();
            value = value === undefined || value === null ? "" : value.toString();
            if (element.tagName === "INPUT") {
                element.value = value;
            }
            else if (view.permission === "visible") {
                element.firstChild.innerHTML = value;
            }
            else {
                element.firstChild.innerHTML = element.lastChild.value = value;
            }
        }
        // 获取到该view上的值。
        getValue(view) {
            let element = view.element();
            if (element.tagName === "INPUT") {
                return element.value;
            }
            else if (view.permission === "visible") {
                return element.firstChild.innerHTML;
            }
            else {
                return element.lastChild.value;
            }
        }
    }
    Quic.TextBuilder = TextBuilder;
    ;
    viewBuilders.text = viewBuilders.number = viewBuilders.int = viewBuilders.string = new TextBuilder();
    class TextareaBuilder extends TextBuilder {
        constructor() {
            super();
            this.editable = (view) => {
                let element = Quic.dom.createElement("textarea");
                element.name = view.name;
                return element;
            };
            this.readonly = (view) => {
                let element = Quic.dom.createElement("textarea");
                element.name = view.name;
                element.readOnly = true;
                return element;
            };
        }
    }
    viewBuilders.textarea = new TextareaBuilder();
    function createFieldElement(view) {
        let field = view.field;
        let permission = view.permission;
        let creator = this[permission];
        if (!creator)
            throw new Error("Invalid permission value:" + permission);
        let cssor = view.Css[view.permission];
        if (!cssor)
            throw new Error("Invalid permission value:" + permission);
        let element = Quic.dom.createElement("div");
        element.className = cssor();
        if (permission === "hidden")
            element.style.display = "none";
        let id = "quic_input_" + Quic.nextGNo();
        let text = this.text || field.fieldset._T(this.text) || field.fieldset._T(this.name);
        let required = (view.validatable && field.hasValidation("required")) ? "<ins class='field-required'>*</ins>" : "";
        element.innerHTML = `<label class="field-caption" for="${id}">${text}${required}</label>`;
        let input = creator(view);
        let forcusElement = input["quic-label-focus-element"] || input;
        forcusElement.id = id;
        element.appendChild(input);
        let validInfos = field.validationInfos(this.fieldset);
        if (view.validatable && permission === "editable" && validInfos) {
            let info = document.createElement("label");
            info.for = id;
            info.className = "field-valid-infos";
            element.appendChild(info);
            let validTick;
            let ul = Quic.dom.createElement("ul");
            ul.className = "validation-infos";
            for (let n in validInfos) {
                let li = Quic.dom.createElement("li");
                li.name = n;
                li.innerHTML = validInfos[n];
                ul.appendChild(li);
            }
            element["quic-validation-infos"] = ul;
            let valid = () => {
                if (validTick)
                    clearTimeout(validTick);
                validTick = 0;
                this.viewValidate(input);
            };
            let delayValid = () => {
                if (validTick)
                    clearTimeout(validTick);
                validTick = setTimeout(() => {
                    if (validTick)
                        clearTimeout(validTick);
                    validTick = 0;
                    this.viewValidate(input);
                }, 200);
            };
            Quic.dom.attach(forcusElement, "keydown", delayValid);
            Quic.dom.attach(forcusElement, "keyup", delayValid);
            Quic.dom.attach(forcusElement, "change", valid);
            Quic.dom.attach(forcusElement, "blur", valid);
        }
        return element;
    }
    Quic.createFieldElement = createFieldElement;
})(Quic || (Quic = {}));
