/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
var Quic;
(function (Quic) {
    Quic.renderers = {};
    class TextRenderer {
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
    Quic.TextRenderer = TextRenderer;
    ;
    Quic.renderers.text = Quic.renderers.number = Quic.renderers.int = Quic.renderers.string = new TextRenderer();
    class TextareaRenderer extends TextRenderer {
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
    Quic.renderers.textarea = new TextareaRenderer();
})(Quic || (Quic = {}));
