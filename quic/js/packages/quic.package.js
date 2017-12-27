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
/// <reference path="../views/quic.view.ts" />
var Quic;
(function (Quic) {
    var Packages;
    (function (Packages) {
        var Package = /** @class */ (function (_super) {
            __extends(Package, _super);
            function Package(opts) {
                var _this = _super.call(this, function (resolve, reject) {
                    _this.fields = _this.field_config(opts.setting || "detail", opts.fields || opts.includes);
                    resolve(_this);
                }) || this;
                _this.field_settings = {};
                return _this;
            }
            Package.prototype.field_config = function (setting, includes, excludes) {
                if (!this.fields)
                    this.dynamic = true;
                if (this.dynamic && includes) {
                    this.fields = this.fields || {};
                    for (var n in includes) {
                        var include = includes[n];
                        var field = {};
                        for (var m in include) {
                            if (Quic.Views.viewOptsKeymembers[m])
                                field[m] = Quic.deepClone(include[m]);
                        }
                        this.fields[n] = field;
                    }
                }
                var existed = this.field_settings[setting];
                if (!existed) {
                    if (!this.fields) {
                        throw new Quic.Exception("field is not defined");
                    }
                    return combine(this.fields, includes, excludes);
                }
                else {
                    return combine(existed, includes, excludes);
                }
            };
            return Package;
        }(Quic.Promise));
        Packages.Package = Package;
        function combine(origins, includes, excludes) {
            if (!origins)
                throw new Quic.Exception("both fields and includes  are not defined");
            if (!includes)
                includes = origins;
            var result = {};
            for (var name_1 in includes) {
                var include = includes[name_1];
                var origin = origins[name_1];
                if (!origin) {
                    continue;
                }
                if (include === origin) {
                    continue;
                }
                if (excludes) {
                    var isDenied = void 0;
                    for (var i in excludes) {
                        if (excludes[i] === name_1) {
                            isDenied = true;
                            break;
                        }
                    }
                    if (isDenied)
                        continue;
                }
                var field = result[name_1] = Quic.deepClone(origin);
                Quic.extend(field, include, false);
            }
            return result;
        }
    })(Packages = Quic.Packages || (Quic.Packages = {}));
})(Quic || (Quic = {}));
