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
    var Module = /** @class */ (function (_super) {
        __extends(Module, _super);
        function Module(name) {
            var _this = _super.call(this) || this;
            _this.name = name;
            return _this;
        }
        Module.prototype.heart_beat = function () {
            this.__last_heart_beat_time__ = new Date();
            return this;
        };
        return Module;
    }(Quic.Promise));
    Quic.Module = Module;
    var cached_modules = {};
    function require() {
        var modnames = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            modnames[_i] = arguments[_i];
        }
        var depnames;
        var invokeByApply = true;
        var arg0 = arguments[0];
        if (typeof arg0 === 'object' && Object.prototype.toString.call(this, arg0) === "{object,Array}") {
            depnames = depnames;
            invokeByApply = arguments[1];
        }
        else {
            depnames = [];
            for (var i = 0, j = arguments.length; i < j; i++)
                depnames.push(arguments[i]);
        }
        return new Quic.Promise(function (resolve, reject) {
            var deps = [];
            var count = depnames.length;
            var task_count = count;
            var hasError = false;
            var _loop_1 = function (i) {
                module(depnames[i]).then(function (value) {
                    if (hasError)
                        return;
                    deps[i] = value;
                    if (--task_count == 0)
                        resolve(deps, invokeByApply);
                }, function (err, at) {
                    hasError = true;
                    reject(err, at);
                });
            };
            for (var i = 0; i < count; i++) {
                _loop_1(i);
            }
        });
    }
    function module(name) {
        var module = cached_modules[name];
        if (!module) {
            module = new Module(name);
            cached_modules[name] = module;
            var url = name; // makeUrl(name);
            var res = Quic.ctx.loadScript(url).then(function (scriptExports) {
                if (scriptExports.__isdefine__) {
                    scriptExports.then(function (defineResults) {
                        module.resolve(defineResults.value);
                        module.deps = defineResults.deps;
                        module.isdefine = true;
                    });
                }
                else
                    module.value = scriptExports;
                module.resolve(module.value);
            }, function (err, at) {
                module.error = err;
                module.reject(err, at);
            });
            cached_modules[name] = module;
        }
        module.heart_beat();
        return module;
    }
    Quic.module = module;
    function define(modname, depnames, definer) {
        if (typeof modname !== "string") {
            definer = depnames;
            depnames = modname;
        }
        var result = new Quic.Promise(function (resolve, reject) {
            require(depnames, true).then(function (deps) {
                var module_value;
                try {
                    module_value = definer.apply(result, deps);
                }
                catch (ex) {
                    result.reject(ex);
                    return;
                }
                if (module_value !== result)
                    result.resolve({
                        value: module_value,
                        isdefine: true,
                        deps: deps
                    });
            }, function (err, at) {
                result.reject(err, at);
            });
        });
        result.__isdefine__ = true;
        Quic.exports = result;
        return result;
    }
    Quic.define = define;
})(Quic || (Quic = {}));
