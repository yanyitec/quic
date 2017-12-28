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
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../models/quic.model.ts" />
/// <reference path="../quic.instance.ts" />
var Quic;
(function (Quic) {
    var Views;
    (function (Views) {
        Views.viewOptsKeymembers = {
            perm: true,
            datapath: true,
            text: true,
            template: true,
            css: true,
            dataType: true,
            viewType: true,
            desciption: true,
            position: true,
            validations: true,
            events: true
        };
        var View = /** @class */ (function (_super) {
            __extends(View, _super);
            function View(opts, composite, model, quic) {
                var _this = _super.call(this) || this;
                if (!opts)
                    return _this;
                _this.init(opts, composite, model, quic);
                return _this;
            }
            View.prototype.id = function () {
                var id = this.idprefix + Quic.GNo(this.idprefix);
                this.id = function () { return id; };
                return id;
            };
            View.prototype.value = function (value) {
                if (value === undefined)
                    return this.model.get_value();
                if (value === "quic:undefined")
                    this.model.set_value(undefined);
                this.model.set_value(value);
                return this;
            };
            View.prototype.disabled = function (value) {
                if (value === undefined) {
                    return this._disabled !== undefined;
                }
                if (value === false) {
                    if (this._disabled) {
                        this.element.style.display = "";
                        for (var i = 0, j = this._disabled.length; i < j; i++) {
                            this.element.appendChild(this._disabled[i]);
                        }
                        this._disabled = undefined;
                    }
                    return this;
                }
                else {
                    if (this._disabled)
                        return this;
                    this.element.style.display = "none";
                    this._disabled = [];
                    for (var i = 0, j = this.element.childNodes.length; i < j; i++) {
                        this._disabled.push(this.element.firstChild);
                        this.element.removeChild(this.element.firstChild);
                    }
                    return this;
                }
            };
            View.prototype.permission = function (value) {
                if (value === undefined) {
                    if (this._permission === undefined) {
                        if (this.composite)
                            this._permission = this._originPermission = (this.composite.permission() || "validatable");
                        else
                            this._permission = this._originPermission = "validatable";
                    }
                    return this._permission;
                }
                if (this._permission !== value) {
                    var oldPerm = this._permission;
                    if (this.element) {
                        if (value === "quic:reset") {
                            return this.permission(this._originPermission);
                        }
                        this._permission = value;
                        var element = this.element;
                        if (value === "disabled") {
                            return this.disabled(true);
                        }
                        else {
                            this.disabled(false);
                        }
                        var wrapper = this.element.quic_wrapFor.parentNode;
                        if (value === "visible") {
                            this.setPermissionCss("visible");
                            wrapper.innerHTML = "";
                            var inputElement = this.render_visibleonly();
                            wrapper.appendChild(inputElement);
                            this._validatable = false;
                            return this;
                        }
                        if (oldPerm === "visible" || oldPerm === "disabled") {
                            var inputElement = this.render_writable();
                            wrapper.appendChild(inputElement);
                        }
                        if (value === "hidden") {
                            this.setPermissionCss("hidden");
                            this._validatable = false;
                        }
                        else if (value === "readonly") {
                            this.setPermissionCss("readonly");
                            this.readonly(true);
                            this._validatable = false;
                            element.style.display = "";
                        }
                        else if (value === "writable") {
                            this.setPermissionCss("writable");
                            this.readonly(false);
                            this._validatable = false;
                        }
                        else if (value === "validatable") {
                            this.setPermissionCss("validatable");
                            this._validatable = true;
                        }
                    }
                    else {
                        this._permission = value === "quic:reset" ? this._originPermission : value;
                    }
                }
                return this;
            };
            View.prototype.readonly = function (value) {
                var perm = this.permission();
                if (value === undefined) {
                    return perm === "visible" || perm === "readonly";
                }
                if (perm === "disabled" || perm === "visible" || perm === "readonly")
                    return this;
                if (this.element) {
                    if (value === true) {
                        this.element.quic_input.readOnly = true;
                        this._validatable = false;
                    }
                    else {
                        this.element.quic_input.readOnly = false;
                        this.element.quic_input.removeAttribute("readonly");
                        if (this._permission === "validatable") {
                            this._validatable = true;
                        }
                    }
                }
                else {
                    this._permission = "readonly";
                }
            };
            View.prototype.render = function (decoration) {
                var element = this.element = Quic.ctx.createElement("div");
                var id = this.id() + "_input";
                var perm = this.permission();
                var inputElement;
                if (perm === "visible") {
                    inputElement = this.render_visibleonly();
                }
                else {
                    inputElement = this.render_writable();
                }
                inputElement.className = "quic-input";
                var actualInput = element.quic_input = inputElement.quic_input || inputElement;
                element.quic_wrapFor = inputElement;
                inputElement.quic_wrapBy = actualInput.quic_wrapBy = element;
                inputElement.quic_view = actualInput.quic_view = actualInput.quic_view = this;
                element.className = this.css += perm;
                if (perm === "readonly") {
                    this.readonly(true);
                }
                else if (perm === "validatable") {
                    this._validatable = true;
                }
                if (decoration === false) {
                    element.appendChild(inputElement);
                }
                else {
                    var html = '<label for="' + id + '" class="quic-label">' + this.text + '</label><span class="quic-control"></span><label for="' + id + '" class="quic-ins"></label>';
                    element.innerHTML = html;
                    element.childNodes[1].appendChild(inputElement);
                }
                actualInput.id = id;
                return element;
            };
            View.prototype.dispose = function () {
            };
            View.prototype._T = function (key) {
                return this.quic._T(key);
            };
            View.prototype.init = function (opts, composite, model, quic) {
                this.opts = opts;
                if (!(this.quic = quic) && composite) {
                    this.quic = composite.quic;
                }
                this.name = opts.name;
                this.dataType = opts.dataType || "text";
                this.viewType = opts.viewType || this.dataType;
                this.validations = opts.validations;
                this._permission = opts.perm;
                if (this.composite = composite) {
                    this.idprefix = composite.idprefix + "_" + this.name;
                }
                else {
                    this.idprefix = this.name;
                }
                this.text = opts.text ? this.quic._T(opts.text) : this.quic._T(this.name);
                this.description = opts.desciption ? quic._T(this.description) : "";
                var css = "";
                if (opts.css)
                    css = opts.css;
                css += " " + this.name;
                css += " " + this.dataType;
                if (this.dataType != this.viewType)
                    css += " " + this.viewType;
                css += " ";
                this.css = css;
                if (model) {
                    this.model = model;
                }
                else {
                    if (this.composite) {
                        if (opts.datapath && this.composite) {
                            this.model = this.composite.model.find(opts.datapath);
                        }
                        else {
                            this.model = this.composite.model;
                        }
                    }
                }
                //this.value = this.model.access(opts.datapath);
            };
            View.prototype.render_visibleonly = function (decoration) {
                var element = Quic.ctx.createElement("span");
                var value = this.value();
                element.innerHTML = value === null || value === undefined ? "" : value;
                element.title = this.description;
                return element;
            };
            View.prototype.render_writable = function (decoration) {
                var _this = this;
                var element = this.element = Quic.ctx.createElement("input");
                element["quic-view"] = this;
                element.name = this.name;
                element.type = "text";
                element.placeholder = this.description;
                var value = this.value();
                element.value = value === null || value === undefined ? "" : value;
                var tick;
                var change = function () {
                    if (tick)
                        clearTimeout(tick);
                    _this.value(element.value);
                };
                var delayChange = function () {
                    if (tick)
                        clearTimeout(tick);
                    tick = setTimeout(change, 200);
                };
                Quic.ctx.attach(element, "blur", change);
                Quic.ctx.attach(element, "keyup", delayChange);
                Quic.ctx.attach(element, "keydown", delayChange);
                return element;
            };
            View.prototype.setPermissionCss = function (perm) {
                if (perm === "disabled" || perm === "hidden") {
                    this.element.style.display = "none";
                    return this;
                }
                else {
                    this.element.style.display = "block";
                }
                var css = this.element.className;
                if (!css) {
                    this.element.className = perm;
                }
                var csses = css.split(" ");
                var cssText = "";
                for (var i = 0, j = csses.length; i < j; i++) {
                    var c = csses[i];
                    if (!c)
                        continue;
                    if (c === "visible" || c === "readonly" || c === "editable" || c === "validatable") {
                        continue;
                    }
                    cssText += " " + c;
                }
                this.element.className = cssText + " " + perm;
                return this;
            };
            View.clone = function (src, cloneView, composite, model) {
                if (!cloneView) {
                    var CLS = Views.viewTypes[src.viewType];
                    if (!CLS)
                        throw new Error("invalid viewType");
                    cloneView = new CLS(null);
                }
                cloneView.name = src.name;
                cloneView.dataType = src.dataType;
                cloneView.viewType = src.viewType;
                cloneView.value = src.value;
                cloneView.text = src.text;
                cloneView.css = src.css;
                cloneView.description = src.description;
                cloneView.idprefix = src.idprefix;
                cloneView.quic = src.quic;
                if (src.validations) {
                    var valids = {};
                    for (var validname in src.validations) {
                        valids[validname] = src.validations[validname];
                    }
                    cloneView.validations = valids;
                }
                cloneView.composite = composite;
                cloneView.model = model;
                return cloneView;
            };
            View.viewTypes = { "view": View };
            return View;
        }(Quic.Observable));
        Views.View = View;
        Views.viewTypes = View.viewTypes;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
exports.View = Quic.Views.View;
