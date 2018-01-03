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
/// <reference path="models/quic.model.ts" />
/// <reference path="models/quic.schema.ts" />
/// <reference path="views/quic.view.ts" />
/// <reference path="packages/quic.package.ts" />
var Quic;
(function (Quic) {
    var QuicInstance = /** @class */ (function (_super) {
        __extends(QuicInstance, _super);
        function QuicInstance(opts, pack) {
            var _this = _super.call(this, function (resolve, reject) { return initialize(_this, opts, pack, resolve, reject); }) || this;
            return _this;
        }
        QuicInstance.prototype._T = function (key, valueRequired) { return key; };
        return QuicInstance;
    }(Quic.Promise));
    Quic.QuicInstance = QuicInstance;
    var quicType = Quic;
    for (var n in QuicInstance.prototype) {
        quicType.prototype[n] = QuicInstance.prototype[n];
    }
    for (var n in Quic.Observable.prototype) {
        quicType.prototype[n] = Quic.Observable.prototype[n];
    }
    function initialize(instance, opts, pack, resolve, reject) {
        instance.opts = opts;
        instance.element = opts.element;
        instance.package = pack || new Quic.Packages.Package(opts);
        instance.package.done(function (pack) { return packageDone(instance, opts, resolve, reject); });
    }
    function packageDone(instance, opts, resolve, reject) {
        instance.fields = instance.package.field_config(opts.setting, opts.includes || opts.fields, opts.excludes, opts.permission);
        var controller;
        if (opts.controller) {
            if (typeof opts.controller === "function") {
                controller = instance.controller = new opts.controller(opts, instance);
            }
            else {
                controller = instance.controller = opts.controller || {};
            }
        }
        else {
            controller = instance.controller = {};
        }
        controller.$quic = this;
        controller.$opts = opts;
        notify(instance, "initing", opts, instance);
        controller.$model = instance.model = initModel(opts, controller);
        var viewType = Quic.Views.viewTypes[opts.viewType || "form"];
        if (!viewType)
            throw new Quic.Exception("Invalid view type", opts.viewType, opts);
        controller.$view = instance.view = new viewType(instance, null, instance.model, instance);
        notify(instance, "created", instance.model, instance.view, instance);
        instance.model.fetch().done(function (data) { return modelDone(data, instance, resolve, reject); });
    }
    function modelDone(data, instance, resolve, reject) {
        notify(instance, "binding", data, instance);
        instance.model.set_value(data);
        if (instance.element) {
            var viewElement = instance.view.render();
            notify(instance, "rendering", viewElement, instance);
            if (instance.element) {
                instance.element.innerHTML = "";
                instance.element.appendChild(viewElement);
                notify(instance, "renderred", viewElement, instance);
            }
        }
    }
    function notify(instance, name, arg0, arg1, arg2) {
        if (instance[name])
            instance[name].call(instance, arg0, arg1, arg2);
        instance.notify(name, arg0, arg1, arg2);
        if (instance.controller[name])
            instance.controller[name].call(instance, arg0, arg1, arg2);
    }
    function initModel(modelOpts, modelData) {
        var model = new Quic.Models.Model(modelOpts || {});
        for (var n in modelData) {
            var member = modelData[n];
            configModel(model, n, member);
        }
        return model;
    }
    function configModel(model, name, value) {
        if (!/^[a-zA-Z]/g.test(name))
            return;
        if (!value) {
            return;
        }
        var t = typeof value;
        if (t === "function")
            return;
        var subModel = model.define(name);
        if (value.length !== undefined && value.pop && value.push) {
            subModel.define("quid:array");
            if (value.length > 0) {
                for (var i in value) {
                    configModel(model, i, value[i]);
                }
            }
        }
        else if (t === "object") {
            for (var n in value) {
                configModel(subModel, n, value[n]);
            }
        }
    }
})(Quic || (Quic = {}));
exports.Quic = Quic.QuicInstance;
