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
            decoration: true,
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
            View.prototype.get_viewid = function () {
                var id = this.$idprefix + Quic.GNo(this.$idprefix);
                this.get_viewid = function () { return id; };
                return id;
            };
            View.prototype.get_value = function () {
                return this.$model.get_value();
            };
            View.prototype.set_value = function (value) {
                this.$model.set_value(value);
                return this;
            };
            View.prototype.validate = function (state) {
                if (!this.__validatable || !this.$validations)
                    return true;
                var value = this.get_value();
                var result;
                var element = this.$element;
                var tipElement = (element.lastChild || element);
                for (var n in this.$validations) {
                    var validator = Views.validators[n];
                    if (!validator) {
                        Quic.ctx.warn("unregistered validation", n);
                        continue;
                    }
                    var validation = this.$validations[n];
                    result = validator(value, validation, this);
                    if (element) {
                        if (result === false) {
                            Quic.ctx.removeClass(element, "quic-validation-success");
                            Quic.ctx.removeClass(element, "quic-validation-validating");
                            Quic.ctx.addClass(element, "quic-validation-error");
                            var tip = tipElement.title = Quic.str_replace(this._T("-valid-" + n), validation);
                            if (state)
                                state[this.$name] = {
                                    message: tip,
                                    name: this.$name,
                                    id: this.get_viewid(),
                                    text: this.$text
                                };
                        }
                        else if (result === null) {
                            Quic.ctx.removeClass(element, "quic-validation-success");
                            Quic.ctx.addClass(element, "quic-validation-validating");
                            Quic.ctx.removeClass(element, "quic-validation-error");
                            tipElement.title = "";
                        }
                        else {
                            Quic.ctx.addClass(element, "quic-validation-error");
                            Quic.ctx.removeClass(element, "quic-validation-validating");
                            Quic.ctx.removeClass(element, "quic-validation-success");
                            tipElement.title = "";
                        }
                    }
                }
                return result;
            };
            View.prototype.is_disabled = function (value) {
                if (value === undefined) {
                    return this.__disabled !== undefined;
                }
                if (value === false) {
                    if (this.__disabled) {
                        this.$element.style.display = "";
                        for (var i = 0, j = this.__disabled.length; i < j; i++) {
                            this.$element.appendChild(this.__disabled[i]);
                        }
                        this.__disabled = undefined;
                    }
                    return this;
                }
                else {
                    if (this.__disabled)
                        return this;
                    this.$element.style.display = "none";
                    this.__disabled = [];
                    for (var i = 0, j = this.$element.childNodes.length; i < j; i++) {
                        this.__disabled.push(this.$element.firstChild);
                        this.$element.removeChild(this.$element.firstChild);
                    }
                    return this;
                }
            };
            View.prototype.get_permission = function () {
                if (this.__permission === undefined) {
                    if (this.$composite)
                        this.__permission = this.__originPermission = (this.$composite.get_permission() || "validatable");
                    else
                        this.__permission = this.__originPermission = "validatable";
                }
                return this.__permission;
            };
            View.prototype.set_permission = function (value) {
                if (this.__permission !== value) {
                    var oldPerm = this.__permission;
                    if (this.$element) {
                        if (value === "quic:reset") {
                            return this.set_permission(this.__originPermission);
                        }
                        this.__permission = value;
                        var element = this.$element;
                        if (value === "disabled") {
                            return this.is_disabled(true);
                        }
                        else {
                            this.is_disabled(false);
                        }
                        var wrapper = this.$element.quic_wrapFor.parentNode;
                        if (value === "visible") {
                            this.setPermissionCss("visible");
                            wrapper.innerHTML = "";
                            var inputElement = this.render_visibleonly();
                            wrapper.appendChild(inputElement);
                            this.__validatable = false;
                            return this;
                        }
                        if (oldPerm === "visible" || oldPerm === "disabled") {
                            var inputElement = this.render_writable();
                            wrapper.appendChild(inputElement);
                        }
                        if (value === "hidden") {
                            this.setPermissionCss("hidden");
                            this.__validatable = false;
                        }
                        else if (value === "readonly") {
                            this.setPermissionCss("readonly");
                            this.is_readonly(true);
                            this.__validatable = false;
                            element.style.display = "";
                        }
                        else if (value === "writable") {
                            this.setPermissionCss("writable");
                            this.is_readonly(false);
                            this.__validatable = false;
                        }
                        else if (value === "validatable") {
                            this.setPermissionCss("validatable");
                            this.__validatable = true;
                        }
                    }
                    else {
                        this.__permission = value === "quic:reset" ? this.__originPermission : value;
                    }
                }
                return this;
            };
            View.prototype.is_readonly = function (value) {
                var perm = this.get_permission();
                if (value === undefined) {
                    return perm === "visible" || perm === "readonly";
                }
                if (perm === "disabled" || perm === "visible" || perm === "readonly")
                    return this;
                if (this.$element) {
                    if (value === true) {
                        this.$element.quic_input.readOnly = true;
                        this.__validatable = false;
                    }
                    else {
                        this.$element.quic_input.readOnly = false;
                        this.$element.quic_input.removeAttribute("readonly");
                        if (this.__permission === "validatable") {
                            this.__validatable = true;
                        }
                    }
                }
                else {
                    this.__permission = "readonly";
                }
            };
            View.prototype.render = function (decoration) {
                var element = this.$element = Quic.ctx.createElement("div");
                var id = this.get_viewid() + "_input";
                if (this.$decoration != undefined)
                    decoration = this.$decoration;
                var perm = this.get_permission();
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
                element.className = this.$css += perm;
                if (perm === "readonly") {
                    this.is_readonly(true);
                }
                else if (perm === "validatable") {
                    this.__validatable = true;
                }
                if (decoration === false) {
                    element.appendChild(inputElement);
                }
                else {
                    var required = this.$validations && this.$validations.required;
                    var html = '<label for="' + id + '" class="quic-label">' + this.$text
                        + (required ? "<span class='required'>*</span>" : "")
                        + '</label><span class="quic-control"></span><label for="' + id + '" class="quic-ins"></label>';
                    element.innerHTML = html;
                    element.childNodes[1].appendChild(inputElement);
                }
                actualInput.id = id;
                return element;
            };
            View.prototype.dispose = function () {
            };
            View.prototype._T = function (key) {
                return this.$quic._T(key);
            };
            View.prototype.init = function (opts, composite, model, quic) {
                this.$opts = opts;
                if (!(this.$quic = quic) && composite) {
                    this.$quic = composite.$quic;
                }
                this.$name = opts.name;
                this.$dataType = opts.dataType || "text";
                this.$viewType = opts.viewType || this.$dataType;
                this.$validations = opts.validations;
                this.$decoration = opts.decoration;
                this.__permission = opts.perm;
                if (this.$composite = composite) {
                    this.$idprefix = composite.$idprefix + "_" + this.$name;
                }
                else {
                    this.$idprefix = this.$name;
                }
                this.$text = opts.text ? this.$quic._T(opts.text) : this.$quic._T(this.$name);
                this.$description = opts.desciption ? quic._T(this.$description) : "";
                var css = "";
                if (opts.css)
                    css = opts.css;
                css += " " + this.$name;
                css += " " + this.$dataType;
                if (this.$dataType != this.$viewType)
                    css += " " + this.$viewType;
                css += " ";
                this.$css = css;
                if (model) {
                    this.$model = model;
                }
                else {
                    if (this.$composite) {
                        if (opts.datapath && this.$composite) {
                            this.$model = this.$composite.$model.find(opts.datapath);
                        }
                        else {
                            this.$model = this.$composite.$model;
                        }
                    }
                }
            };
            View.prototype.render_visibleonly = function (decoration) {
                var element = Quic.ctx.createElement("span");
                var value = this.get_value();
                element.innerHTML = value === null || value === undefined ? "" : value;
                element.title = this.$description;
                return element;
            };
            View.prototype.render_writable = function (decoration) {
                var _this = this;
                var element = Quic.ctx.createElement("input");
                element["quic-view"] = this;
                element.name = this.$name;
                element.type = "text";
                element.placeholder = this.$description;
                var value = this.get_value();
                element.value = value === null || value === undefined ? "" : value;
                var tick;
                var change = function () {
                    if (tick)
                        clearTimeout(tick);
                    _this.set_value(element.value);
                    _this.validate();
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
                    this.$element.style.display = "none";
                    return this;
                }
                else {
                    this.$element.style.display = "block";
                }
                var css = this.$element.className;
                if (!css) {
                    this.$element.className = perm;
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
                this.$element.className = cssText + " " + perm;
                return this;
            };
            View.viewTypes = { "view": View };
            View.validators = {};
            return View;
        }(Quic.Observable));
        Views.View = View;
        Views.viewTypes = View.viewTypes;
        Views.viewTypes.text = View;
        Views.validators = View.validators;
        Views.validators.required = function (value, validation, view) {
            var val = typeof value == "string" ? value.replace(/(^\s+)|(\s+$)/g, "") : value;
            if (val)
                return true;
            else
                return false;
        };
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
exports.View = Quic.Views.View;
