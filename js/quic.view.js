/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic) {
    class View {
        constructor(container, field, opts) {
            this.container = container;
            this.field = field;
            this.opts = opts;
            this.name = opts.name || field.name;
            //viewType && viewBuilder
            this.viewType = opts.viewType;
            if (this.viewType === field.viewType)
                this.viewRenderer = field.viewRenderer;
            if (!this.viewRenderer)
                this.viewRenderer = this.field.findViewRenderer(this.viewType);
            if (!this.viewRenderer)
                return Quic.env.throw("Invalid viewType", this.viewType);
            // css
            if (!opts.css || opts.css === field.css) {
                this.css = opts.css;
                this.Css = field.Css;
            }
            else {
                this.Css = new ViewCSS(this.css = opts.css);
            }
            //permission
            this.permission = opts.permission || field.permission || container.permission;
            if (this.permission === "novalidate") {
                this.permission = "editable";
            }
            else {
                this.validatable = field;
            }
            let mappath = opts.mappath ? opts.mappath.replace(Quic.trimRegx, "") : undefined;
            if (mappath !== field.mappath) {
                this.mappath = mappath;
                this.mappedValue = Quic.mappedValue;
            }
            else {
                this.mappath = field.mappath;
                this.mappedValue = field.mappedValue;
            }
        }
        value(value) {
            if (value === undefined)
                return this.viewRenderer.getValue(this);
            this.viewRenderer.setValue(this, value);
            return this;
        }
        getAccessor(mappath) {
            return this.field.getAccessor(mappath);
        }
        element() {
            if (this._element)
                return this._element;
            let creator = this.viewRenderer[this.permission];
            if (!creator)
                throw new Error("Invalid permission value:" + this.permission);
            creator(this);
        }
        validate() {
            if (this.validatable) {
                return this.validatable.validate(this.value(), this);
            }
        }
    }
    Quic.View = View;
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
    Quic.viewRenderers = {};
})(Quic || (Quic = {}));
