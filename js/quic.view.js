/// <reference path="quic.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.data.ts" />
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
            this.base = base;
        }
    }
    Quic.ViewCSS = ViewCSS;
    function isHtmlNode(node) {
        return node.nodeType !== undefined && node.getAttribute && node.appendChild;
    }
    Quic.isHtmlNode = isHtmlNode;
    Quic.viewBuilders = {};
    class TextBuilder {
        constructor() { }
        //只是可见，没有input元素跟着
        visible(view, data) {
            let element = Quic.dom.createElement("input");
            let value = view.dataValue(data);
            element.innerHTML = value === undefined || value === null ? "" : value;
            return element;
        }
        //隐藏，但是有input元素
        hidden(view, data) {
            let element = Quic.dom.createElement("input");
            element.type = "hidden";
            let value = view.dataValue(data);
            element.value = value === undefined || value === null ? "" : value;
            return element;
        }
        //只读，不能修改，但是有input元素
        readonly(view, data) {
            let element = Quic.dom.createElement("span");
            let value = view.dataValue(data);
            value = value === undefined || value === null ? "" : value;
            element.innerHTML = `<span>${value}</span><input type="hidden" name="${view.name}" />`;
            element.lastChild.value = value;
            return element;
        }
        // 可编辑
        editable(view, data) {
            let element = Quic.dom.createElement("input");
            element.type = "text";
            let value = view.dataValue(data);
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
            this.editable = (view, data) => {
                let element = Quic.dom.createElement("textarea");
                let value = view.dataValue(data);
                element.value = value === undefined || value === null ? "" : value;
                return element;
            };
        }
    }
    Quic.viewBuilders.textarea = new TextareaBuilder();
})(Quic || (Quic = {}));
