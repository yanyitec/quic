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
/// <reference path="quic.view.ts" />
var Quic;
(function (Quic) {
    var Views;
    (function (Views) {
        var FormView = /** @class */ (function (_super) {
            __extends(FormView, _super);
            function FormView(opts, composite, model, quic) {
                var _this = _super.call(this, opts, composite, model, quic) || this;
                _this.$viewType = "form";
                return _this;
            }
            FormView.prototype.permission = function (value) {
                if (value === undefined) {
                    if (this.__permission === undefined) {
                        if (this.$composite)
                            this.__permission = this.__originPermission = (this.$composite.get_permission() || "validatable");
                        else
                            this.__permission = this.__originPermission = "validatable";
                    }
                    return this.__permission;
                }
                if (value !== this.__permission) {
                    if (this.$element) {
                        if (value === "disabled") {
                            return this.is_disabled(true);
                        }
                        else {
                            this.is_disabled(false);
                        }
                        if (value === "hidden") {
                            this.__permission = value;
                            this.$element.style.display = "none";
                        }
                        else {
                            this.__permission = value === "quic:rollback" ? this.__originPermission : value;
                            var components = this.$components;
                            for (var n in components) {
                                components[n].set_permission(value);
                            }
                        }
                        return this;
                    }
                    else {
                        this.__permission = value === "quic:reset" ? this.__originPermission : value;
                    }
                }
            };
            FormView.prototype.render = function (decoration) {
                var element = Quic.ctx.createElement("div");
                this.$element = element;
                var id = this.$name;
                var title = this.$opts.title || this.$name;
                title = this._T(title);
                var headAtions, content, bodyActions, status, footActions;
                if (decoration === false) {
                    var html = "<div class='quic-content'></div><div class='quic-actions'></div>";
                    headAtions = bodyActions = footActions = element.lastChild;
                    content = status = element.firstChild;
                }
                else {
                    var html = '<div class="quic-header"><span class="quic-caption">' + title + '</span><span class="quic-actions"></span></div>';
                    html += '<div class="quic-body"><div class="quic-content"></div><div class="quic-actions"></div></div>';
                    html += '<div class="quic-footer"><span class="quic-status"></span><span class="quic-actions"></span></div>';
                    element.innerHTML = html;
                    var caption = element.firstChild.firstChild;
                    headAtions = element.firstChild.lastChild;
                    var body = element.childNodes[1];
                    content = body.firstChild;
                    bodyActions = body.lastChild;
                    status = element.lastChild.firstChild;
                    footActions = element.lastChild.lastChild;
                    caption.innerHTML = title;
                }
                var components = this.$components;
                for (var viewname in components) {
                    var childview = components[viewname];
                    var childElement = childview.render();
                    var position = childview.$opts.slot;
                    switch (position) {
                        case "header":
                            headAtions.appendChild(childElement);
                            break;
                        case "status":
                            status.appendChild(childElement);
                            break;
                        case "footer":
                            footActions.appendChild(childElement);
                            break;
                        case "actions":
                            bodyActions.appendChild(childElement);
                            break;
                        default: content.appendChild(childElement);
                    }
                }
                return element;
            };
            FormView.prototype.validate = function (state) {
                var hasError = false;
                var result;
                for (var n in this.$components) {
                    if ((result = this.$components[n].validate(state)) === false) {
                        hasError = true;
                    }
                }
                return hasError ? false : result;
            };
            FormView.prototype.waiting = function (block) { };
            FormView.prototype.submit = function (url) {
                var _this = this;
                return new Quic.Promise(function (resolve, reject) {
                    var state = {};
                    if (_this.validate(state) === false) {
                        Quic.ctx.validateInfo(state).done(function () {
                            reject(state, "validate");
                        });
                        return;
                    }
                    Quic.ctx.confirm(_this._T("Do you want to submit?"), _this._T("Confirm")).then(function (result) {
                        if (result === false) {
                            reject(false, "cancel");
                        }
                        else {
                            var value = _this.get_value();
                            var transOpts = _this.$opts.commit_transport || { url: url };
                            transOpts.url = url;
                            if (!transOpts.method)
                                transOpts.method = "POST";
                            if (!transOpts.dataType)
                                transOpts.dataType = "json";
                            if (!transOpts.type)
                                transOpts.type = "json";
                            transOpts.data = value;
                            console.log("commiting", value);
                            _this.waiting(true);
                            Quic.transport(transOpts).then(function (data) { _this.waiting(false); resolve(data); Quic.ctx.message(_this._T("Submit successfully.")); }, function (err, t) { _this.waiting(false); Quic.ctx.alert(_this._T("Submit failed:" + err)); reject(err, "transport"); });
                        }
                    });
                });
            };
            FormView.prototype.render_visibleonly = function (decoration) {
                return this.render(decoration);
            };
            FormView.prototype.render_writable = function (decoration) {
                return this.render(decoration);
            };
            FormView.prototype.init = function (opts, composite, model, quic) {
                _super.prototype.init.call(this, opts, composite, model, quic);
                this.$components = {};
                if (opts.fields) {
                    var compoments = this.$components = {};
                    var children = opts.fields;
                    var me = this;
                    for (var viewname in children) {
                        var child = children[viewname];
                        if (!child.name)
                            child.name = viewname;
                        var viewType = child.viewType || child.dataType || "text";
                        var ViewCls = Views.viewTypes[viewType] || Views.viewTypes[viewType = "text"];
                        child.viewType = viewType;
                        if (opts.name && opts.name != viewname) {
                            throw new Error("View name in opts is different from components");
                        }
                        me[viewname] = compoments[viewname] = new ViewCls(child, this);
                    }
                }
            };
            return FormView;
        }(Views.View));
        Views.FormView = FormView;
        Views.View.viewTypes.form = FormView;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
exports.FormView = Quic.Views.FormView;
