/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Quic;
(function (Quic) {
    Quic.renderers = {};
    var TextRenderer = /** @class */ (function () {
        function TextRenderer() {
        }
        //只是可见，没有input元素跟着
        TextRenderer.prototype.visible = function (view) {
            var element = Quic.dom.createElement("span");
            //element.innerHTML = value===undefined||value===null?"":value;
            return element;
        };
        //隐藏，但是有input元素
        TextRenderer.prototype.hidden = function (view) {
            var element = Quic.dom.createElement("input");
            element.type = "hidden";
            element.name = view.name;
            return element;
        };
        //只读，不能修改，但是有input元素
        TextRenderer.prototype.readonly = function (view) {
            var element = Quic.dom.createElement("input");
            element.type = "text";
            element.readOnly = true;
            element.name = view.name;
            return element;
        };
        // 可编辑
        TextRenderer.prototype.editable = function (view) {
            var element = Quic.dom.createElement("input");
            element.type = "text";
            element.name = view.name;
            return element;
        };
        // 设置View的值，并让view反映该值。
        TextRenderer.prototype.setValue = function (view, value) {
            var element = view.element();
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
        };
        // 获取到该view上的值。
        TextRenderer.prototype.getValue = function (view) {
            var element = view.element();
            if (element.tagName === "INPUT") {
                return element.value;
            }
            else if (view.permission === "visible") {
                return element.firstChild.innerHTML;
            }
            else {
                return element.lastChild.value;
            }
        };
        return TextRenderer;
    }());
    Quic.TextRenderer = TextRenderer;
    ;
    Quic.renderers.text = Quic.renderers.number = Quic.renderers.int = Quic.renderers.string = new TextRenderer();
    var TextareaRenderer = /** @class */ (function (_super) {
        __extends(TextareaRenderer, _super);
        function TextareaRenderer() {
            var _this = _super.call(this) || this;
            _this.editable = function (view) {
                var element = Quic.dom.createElement("textarea");
                element.name = view.name;
                return element;
            };
            _this.readonly = function (view) {
                var element = Quic.dom.createElement("textarea");
                element.name = view.name;
                element.readOnly = true;
                return element;
            };
            return _this;
        }
        return TextareaRenderer;
    }(TextRenderer));
    Quic.renderers.textarea = new TextareaRenderer();
})(Quic || (Quic = {}));
