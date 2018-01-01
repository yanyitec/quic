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
/// <reference path="quic.view-form.ts" />
var Quic;
(function (Quic) {
    var Views;
    (function (Views) {
        var SubmitView = /** @class */ (function (_super) {
            __extends(SubmitView, _super);
            function SubmitView(opts, composite, model, quic) {
                var _this = _super.call(this, opts, composite, model, quic) || this;
                _this.$viewType = "submit";
                _this.$url = opts.url;
                _this.$decoration = false;
                return _this;
            }
            SubmitView.prototype.render_visibleonly = function () {
                var element = Quic.ctx.createElement("input");
                element.type = "submit";
                element.value = this.$text;
                element.disabled = true;
                return element;
            };
            SubmitView.prototype.render_writable = function () {
                var _this = this;
                var element = Quic.ctx.createElement("input");
                element.type = "submit";
                element.value = this.$text;
                Quic.ctx.attach(element, "click", function (evt) {
                    evt || (evt = event);
                    var form = _this;
                    while (form) {
                        form = form.$composite;
                        if (form instanceof Views.FormView) {
                            break;
                        }
                    }
                    if (!form)
                        throw new Quic.Exception("Cannot find form to submit");
                    element.disabled = true;
                    var url;
                    if (_this.$url)
                        url = _this.$model.find(_this.$url).get_value();
                    form.submit(url || "").then(function (data) { element.disabled = true; }, function (err) { return element.disabled = true; });
                });
                return element;
            };
            return SubmitView;
        }(Views.View));
        Views.SubmitView = SubmitView;
        Views.View.viewTypes.submit = SubmitView;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
exports.FormView = Quic.Views.FormView;
