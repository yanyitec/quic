/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.datafield.ts" />
var Quic;
(function (Quic) {
    class ViewCSS {
        constructor(base) {
            this.visible = () => {
                let css = this.base + " field-visible";
                this.visible = () => css;
                return css;
            };
            this.hidden = () => {
                let css = this.base + " field-hidden";
                this.hidden = () => css;
                return css;
            };
            this.readonly = () => {
                let css = this.base + " field-readonly";
                this.readonly = () => css;
                return css;
            };
            this.editable = () => {
                let css = this.base + " field-editable";
                this.editable = () => css;
                return css;
            };
            this.toString = () => this.base;
            this.base = base;
        }
        css(permission) {
            let _this = this;
            let fn = _this[permission];
            if (fn)
                return fn.call(this);
            return this.base;
        }
        ;
    }
    Quic.ViewCSS = ViewCSS;
    Quic.viewBuilders = {};
    class TextBuilder {
        constructor() { }
        //只是可见，没有input元素跟着
        visible(view, value) {
            let element = Quic.dom.createElement("input");
            element.innerHTML = value === undefined || value === null ? "" : value;
            return element;
        }
        //隐藏，但是有input元素
        hidden(view, value) {
            let element = Quic.dom.createElement("input");
            element.type = "hidden";
            element.value = value === undefined || value === null ? "" : value;
            return element;
        }
        //只读，不能修改，但是有input元素
        readonly(view, value) {
            let element = Quic.dom.createElement("span");
            value = value === undefined || value === null ? "" : value;
            element.innerHTML = `<span>${value}</span><input type="hidden" name="${view.name}" />`;
            element.lastChild.value = value;
            return element;
        }
        // 可编辑
        editable(view, value) {
            let element = Quic.dom.createElement("input");
            element.type = "text";
            element.value = value === undefined || value === null ? "" : value;
            return element;
        }
        // 设置View的值，并让view反映该值。
        setViewValue(view, element, value) {
            if (element.tagName === "INPUT") {
                element.value = value;
            }
            else {
                element.lastChild.value = value;
            }
        }
        // 获取到该view上的值。
        getViewValue(view, element) {
            if (element.tagName === "INPUT") {
                return element.value;
            }
            else {
                return element.lastChild.value;
            }
        }
    }
    Quic.TextBuilder = TextBuilder;
    ;
    Quic.viewBuilders.text = Quic.viewBuilders.number = Quic.viewBuilders.int = Quic.viewBuilders.string = new TextBuilder();
    class TextareaBuilder extends TextBuilder {
        constructor() {
            super();
            this.editable = (view, value) => {
                let element = Quic.dom.createElement("textarea");
                element.value = value === undefined || value === null ? "" : value;
                return element;
            };
        }
    }
    Quic.viewBuilders.textarea = new TextareaBuilder();
})(Quic || (Quic = {}));
