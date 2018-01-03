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
                    _this.fields = _this.field_config("", opts.fields || opts.includes);
                    resolve(_this);
                }) || this;
                _this.field_settings = {};
                return _this;
            }
            Package.prototype.field_config = function (setting, includes, excludes, defaultPermission) {
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
                var existed = this.field_settings[setting || ""];
                if (!existed) {
                    if (!this.fields) {
                        throw new Quic.Exception("field is not defined");
                    }
                    if (setting.indexOf(",") >= 0) {
                        if (defaultPermission === undefined)
                            defaultPermission = typeof includes === "string" ? includes : "validatable";
                        includes = parseFieldOptsSet(setting, excludes, defaultPermission);
                    }
                    var result = combine(this.fields, includes, excludes);
                    if (setting)
                        this.field_settings[setting] = result;
                    return result;
                }
                else {
                    if (includes) {
                        return combine(existed, includes, excludes);
                    }
                    else if (excludes) {
                        var result = {};
                        for (var name_1 in existed) {
                            var isDenied = void 0;
                            for (var i in excludes) {
                                if (excludes[i] === name_1) {
                                    isDenied = true;
                                    break;
                                }
                            }
                            if (isDenied)
                                continue;
                            result[name_1] = existed[name_1];
                        }
                        return result;
                    }
                    else {
                        return existed;
                    }
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
            for (var name_2 in includes) {
                var include = includes[name_2];
                var origin = origins[name_2];
                if (!origin) {
                    continue;
                }
                if (include === origin) {
                    continue;
                }
                if (excludes) {
                    var isDenied = void 0;
                    for (var i in excludes) {
                        if (excludes[i] === name_2) {
                            isDenied = true;
                            break;
                        }
                    }
                    if (isDenied)
                        continue;
                }
                var field = result[name_2] = Quic.deepClone(origin);
                Quic.extend(field, include, false);
            }
            return result;
        }
        function parseFieldOptsSet(includeExpr, excludes, defaultPermssion) {
            var destFieldOptsSet = {};
            var includes;
            //id，base[name:readonly,password:editable],gender:hidden
            includes = {};
            var groupname;
            var groupCount = 0;
            var includeExprs = includeExpr.split(",");
            for (var i = 0, j = includeExprs.length; i < j; i++) {
                var expr = includeExprs[i].replace(/(^\s+)|(\s+$)/, "");
                var name_3 = void 0;
                var permission = void 0;
                if (!expr)
                    continue;
                var at = expr.indexOf("[");
                var startAt = 0;
                if (at >= 0) {
                    if (groupname !== undefined)
                        throw new Error("invalid includes expression:" + includeExpr + ". meet[, but the previous [ is not close. lack of ]?");
                    groupname = expr.substr(0, at);
                    startAt = at + 1;
                    groupCount++;
                }
                else
                    at = 0;
                at = expr.indexOf(":", startAt);
                if (at >= 0) {
                    name_3 = expr.substr(0, at).replace(/(^\s+)|(\s+$)/, "");
                    permission = expr.substr(at + 1).replace(/(^\s+)|(\s+$)/, "");
                    if (!permission)
                        throw new Error("invalid includes expression:" + includeExpr + ". meet :, but permission is empty.");
                    ;
                }
                else
                    name_3 = expr.substr(startAt).replace(/(^\s+)|(\s+$)/, "");
                var endGroup = false;
                if (name_3[name_3.length - 1] === "]") {
                    if (!groupname)
                        throw new Error("invalid includes expression:" + includeExpr + ". meet ], but not matched [. lack of [?");
                    ;
                    endGroup = true;
                    name_3 = name_3.substr(0, name_3.length - 1);
                }
                if (!name_3)
                    throw new Error("invalid includes expression:" + includeExpr + ". Some name is empty.");
                if (excludes && Quic.array_index(excludes, name_3) >= 0)
                    continue;
                var fieldOpts = { name: name_3 };
                fieldOpts.perm = permission || defaultPermssion;
                if (groupname !== undefined) {
                    if (groupname == "")
                        groupname = ' ' + groupCount;
                    fieldOpts.slot = groupname;
                }
                destFieldOptsSet[name_3] = fieldOpts;
            }
            return destFieldOptsSet;
        }
    })(Packages = Quic.Packages || (Quic.Packages = {}));
})(Quic || (Quic = {}));
