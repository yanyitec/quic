/// <reference path="quic.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.data.ts" />
/// <reference path="quic.view.ts" />
var Quic;
(function (Quic) {
    class Field extends Quic.DataField {
        constructor(container, opts) {
            super(opts);
            this.container = container;
            this.text = opts.text;
            if (!(this.viewType = opts.viewType)) {
                this.viewType = this.dataType;
            }
            if (!(this.builder = Quic.viewBuilders[this.viewType]))
                throw new Error("Invalid viewType:" + this.viewType + ". viewBuilder is not found.");
            let css = "field " + this.viewType + " " + this.name;
            if (opts.css)
                css += " " + opts.css;
            this.css = new Quic.ViewCSS(css);
        }
        value(data, element, value) {
            if (Quic.isHtmlNode(data)) {
                value = element;
                element = data;
                data = undefined;
            }
            else if (!Quic.isHtmlNode(element)) {
                value = element;
                element = undefined;
            }
            if (value === undefined) {
                if (element) {
                    value = this.builder.getViewValue(this, element);
                    if (data)
                        super.value(data, value);
                }
                else if (data) {
                    value = super.value(data);
                }
                else {
                    throw new Error("must have element or data.");
                }
                return value;
            }
            else {
                if (element) {
                    this.builder.setViewValue(this, element, value);
                    if (data)
                        super.value(data, value);
                }
                else if (data) {
                    super.value(data, value);
                }
                else {
                    throw new Error("must have element or data.");
                }
                return this;
            }
        }
        viewValue(element, value) {
            if (value === undefined)
                return this.builder.getViewValue(this, element);
            this.builder.getViewValue(this, element);
            return this;
        }
        viewValidate(element, data, state) {
            let value = this.builder.getViewValue(this, element);
            if (data)
                this.dataValue(data, value);
            let validType = this.dataValidate(value, state);
            if (validType) {
                let wrapper = element.parentNode;
                while (wrapper) {
                    if (wrapper["quic-field"])
                        break;
                }
                if (wrapper) {
                    let ul = wrapper["quic-validation-infos"];
                    let showErrorInfo = (validType) => {
                        for (let i = 0, j = ul.childNodes.length; i < j; i++) {
                            let li = ul.childNodes[i];
                            if (li.name === validType)
                                li.className = "error";
                            else
                                li.className = "";
                        }
                    };
                    let dom = Quic.dom;
                    if (validType) {
                        showErrorInfo(validType);
                        dom.addClass(wrapper, "validate-error").removeClass(wrapper, "validate-success");
                    }
                    else {
                        dom.removeClass(wrapper, "validate-error");
                        if (validType === null) {
                            dom.addClass(wrapper, "validate-processing");
                        }
                        else
                            dom.addClass(wrapper, "validate-success");
                    }
                }
            }
            return validType;
        }
        createElement(data, permission, validateRequired) {
            let creator = this.builder[permission];
            if (!creator)
                throw new Error("Invalid permission value:" + permission);
            let cssor = this.css[permission];
            if (!cssor)
                throw new Error("Invalid permission value:" + permission);
            let dom = Quic.dom;
            let element = dom.createElement("div");
            element["quic-field"] = this;
            element.className = cssor();
            if (permission === "hidden")
                element.style.display = "none";
            let id = "quic_input_" + Quic.nextGNo();
            let text = this.text || (this._T ? this._T(this.name) : this.name);
            let required = (this.validations && this.validations.required) ? "<ins class='field-required'>*</ins>" : "";
            element.innerHTML = `<label class="field-caption" for="${id}">${text}${required}</label>`;
            let input = creator(this, data);
            let validInput = input["quic-valid-input"] || input;
            input.name = this.name;
            validInput.id = id;
            element.appendChild(input);
            let validInfos = this.validationInfos(this._T, this._accessorFactory);
            if (validateRequired === true && permission === "editable" && validInfos) {
                let info = document.createElement("label");
                info.for = id;
                info.className = "field-valid-infos";
                element.appendChild(info);
                let validTick;
                let ul = dom.createElement("ul");
                ul.className = "validation-infos";
                for (let n in validInfos) {
                    let li = dom.createElement("li");
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
                dom.attach(validInput, "keydown", delayValid);
                dom.attach(validInput, "keyup", delayValid);
                dom.attach(validInput, "change", valid);
                dom.attach(validInput, "blur", valid);
            }
            return element;
        }
    }
    Quic.Field = Field;
})(Quic || (Quic = {}));
