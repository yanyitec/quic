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
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
/// <reference path="quic.fieldset.ts" />
/// <reference path="quic.view-composition.ts" />
var Quic;
(function (Quic) {
    var FieldsetView = /** @class */ (function (_super) {
        __extends(FieldsetView, _super);
        function FieldsetView(quic, pomposition, field, opts) {
            return _super.call(this, quic, pomposition, field, opts) || this;
        }
        return FieldsetView;
    }(Quic.CompositeView));
    Quic.FieldsetView = FieldsetView;
    function parseFieldOptsSet(includeExpr, excludes, defaultPermssion) {
        var destFieldOptsSet = this.fields = {};
        var includes;
        //id，base[name:readonly,password:editable],gender:hidden
        includes = {};
        var groupname;
        var groupCount = 0;
        var includeExprs = includeExpr.split(",");
        for (var i = 0, j = includeExprs.length; i < j; i++) {
            var expr = includeExprs[i].replace(Quic.trimRegx, "");
            var name_1 = void 0;
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
                name_1 = expr.substr(0, at).replace(Quic.trimRegx, "");
                permission = expr.substr(at + 1).replace(Quic.trimRegx, "");
                if (!permission)
                    throw new Error("invalid includes expression:" + includeExpr + ". meet :, but permission is empty.");
                ;
            }
            else
                name_1 = expr.substr(startAt).replace(Quic.trimRegx, "");
            var endGroup = false;
            if (name_1[name_1.length - 1] === "]") {
                if (!groupname)
                    throw new Error("invalid includes expression:" + includeExpr + ". meet ], but not matched [. lack of [?");
                ;
                endGroup = true;
                name_1 = name_1.substr(0, name_1.length - 1);
            }
            if (!name_1)
                throw new Error("invalid includes expression:" + includeExpr + ". Some name is empty.");
            if (excludes && Quic.array_index(excludes, name_1) >= 0)
                continue;
            var fieldOpts = { name: name_1 };
            fieldOpts.permission = permission || defaultPermssion;
            if (groupname !== undefined) {
                if (groupname == "")
                    groupname = ' ' + groupCount;
                fieldOpts.group = groupname;
            }
            destFieldOptsSet[name_1] = fieldOpts;
        }
        return destFieldOptsSet;
    }
    Quic.parseFieldOptsSet = parseFieldOptsSet;
})(Quic || (Quic = {}));
