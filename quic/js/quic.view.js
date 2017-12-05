var Quic;
(function (Quic) {
    var ViewCSS = /** @class */ (function () {
        function ViewCSS(viewOpts) {
            var _this = this;
            this.visible = function () {
                var css = _this.base + " field-visible";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.visible = function () { return css; };
                return css;
            };
            this.hidden = function () {
                var css = _this.base + " field-hidden";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.hidden = function () { return css; };
                return css;
            };
            this.readonly = function () {
                var css = _this.base + " field-readonly";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.readonly = function () { return css; };
                return css;
            };
            this.editable = function () {
                var css = _this.base + " field-editable";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.editable = function () { return css; };
                return css;
            };
            this.validatable = function () {
                var css = _this.base + " field-validatable";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.editable = function () { return css; };
                return css;
            };
            this.toString = function () { return _this.base; };
            this.raw = viewOpts.css;
            this.base = viewOpts.viewType + " " + (viewOpts.icon ? viewOpts.icon + " " : "") + viewOpts.name;
        }
        ViewCSS.prototype.css = function (permission) {
            var _me = this;
            var fn = _me[permission];
            return fn ? fn.call(this) : this.general();
        };
        ;
        ViewCSS.prototype.general = function () {
            var css = this.raw ? this.base + " " + this.raw : this.base;
            this.general = function () { return css; };
            return css;
        };
        return ViewCSS;
    }());
    Quic.ViewCSS = ViewCSS;
    var View = /** @class */ (function () {
        function View(quic, composition, field, opts_) {
            var opts = opts_;
            this.opts = opts;
            this.name = opts.name ? opts.name.replace(Quic.trimRegx, "") : undefined;
            if (!this.name && field)
                this.name = field.name;
            if (!this.name)
                Quic.ctx.throw("name is required", "view.constructor", opts);
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
                this.renderer = quic.findRenderer(this.viewType);
            if (!this.renderer)
                return Quic.ctx.throw("Invalid viewType", this.viewType);
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
                this.mappedValue = quic.accessFactory.cached(this.mappath);
        }
        View.prototype.viewValue = function (value) {
            if (value === undefined)
                return this.renderer.getValue(this);
            this.renderer.setValue(this, value);
            return this;
        };
        View.prototype.element = function () {
            if (this._element)
                return this._element;
            var creator = this.renderer[this.permission];
            if (!creator)
                throw new Error("Invalid permission value:" + this.permission);
            creator(this);
        };
        return View;
    }());
    Quic.View = View;
})(Quic || (Quic = {}));
