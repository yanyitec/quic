/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic) {
    class ViewCSS {
        constructor(viewOpts) {
            this.visible = () => {
                let css = this.base + " field-visible";
                if (this.raw)
                    css += " " + this.raw;
                this.visible = () => css;
                return css;
            };
            this.hidden = () => {
                let css = this.base + " field-hidden";
                if (this.raw)
                    css += " " + this.raw;
                this.hidden = () => css;
                return css;
            };
            this.readonly = () => {
                let css = this.base + " field-readonly";
                if (this.raw)
                    css += " " + this.raw;
                this.readonly = () => css;
                return css;
            };
            this.editable = () => {
                let css = this.base + " field-editable";
                if (this.raw)
                    css += " " + this.raw;
                this.editable = () => css;
                return css;
            };
            this.validatable = () => {
                let css = this.base + " field-validatable";
                if (this.raw)
                    css += " " + this.raw;
                this.editable = () => css;
                return css;
            };
            this.toString = () => this.base;
            this.raw = viewOpts.css;
            this.base = viewOpts.viewType + " " + (viewOpts.icon ? viewOpts.icon + " " : "") + viewOpts.name;
        }
        css(permission) {
            let _this = this;
            let fn = _this[permission];
            return fn ? fn.call(this) : this.general();
        }
        ;
        general() {
            let css = this.raw ? this.base + " " + this.raw : this.base;
            this.general = () => css;
            return css;
        }
    }
    Quic.ViewCSS = ViewCSS;
    class View {
        constructor(module, composition, field, opts_) {
            let opts = opts_;
            this.opts = opts;
            this.name = opts.name ? opts.name.replace(Quic.trimRegx, "") : undefined;
            if (!this.name && field)
                this.name = field.name;
            if (!this.name)
                Quic.env.throw("name is required", "view.constructor", opts);
            this.composition = composition;
            //viewType && viewBuilder
            this.viewType = opts.viewType ? opts.viewType.replace(Quic.trimRegx, "") : undefined;
            if (field) {
                if (!this.viewType)
                    this.viewType = field.viewType;
                if (this.viewType === field.viewType)
                    this.renderer = field.renderer;
            }
            if (!this.renderer)
                this.renderer = module.findRenderer(this.viewType);
            if (!this.renderer)
                return Quic.env.throw("Invalid viewType", this.viewType);
            // css
            this.css = opts.css ? opts.css.replace(Quic.trimRegx, "") : undefined;
            if (field && (!this.css || this.css === field.css))
                this.CSS = field.CSS;
            else
                this.CSS = new ViewCSS(this);
            //permission
            this.permission = opts.permission || (field && field.permission) || (composition && composition.permission) || "validatable";
            this.position = opts.position || (field && field.position) || (composition && composition.position);
            this.nolabel = opts.nolabel || (field && field.nolabel);
            // mappath
            this.mappath = opts.mappath ? opts.mappath.replace(Quic.trimRegx, "") : undefined;
            if (field && (!this.mappath || this.mappath === field.mappath))
                this.mappedValue = field.mappedValue;
            else
                this.mappedValue = module.accessFactory.cached(this.mappath);
        }
        viewValue(value) {
            if (value === undefined)
                return this.renderer.getValue(this);
            this.renderer.setValue(this, value);
            return this;
        }
        element() {
            if (this._element)
                return this._element;
            let creator = this.renderer[this.permission];
            if (!creator)
                throw new Error("Invalid permission value:" + this.permission);
            creator(this);
        }
    }
    Quic.View = View;
})(Quic || (Quic = {}));
