/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.data.ts" />
/// <reference path="quic.view.ts" />
var Quic;
(function (Quic) {
    class Fieldset {
        constructor(opts) {
            this.css = opts.css;
            let destFieldOptsSet = this.fields = {};
            let excludes = opts.excludes
                ? (typeof opts.excludes === "string" ? opts.excludes.split(",") : opts.excludes)
                : undefined;
            let includes;
            //id，base[name:readonly,password:editable],gender:hidden
            if (typeof opts.includes === "string") {
                includes = {};
                let groupname;
                let groupCount = 0;
                let includeExprs = opts.includes.split(",");
                for (let i = 0, j = includeExprs.length; i < j; i++) {
                    let expr = includeExprs[i].replace(Quic.trimRegx, "");
                    let name;
                    let permission;
                    if (!expr)
                        continue;
                    let at = expr.indexOf("[");
                    let startAt = 0;
                    if (at >= 0) {
                        if (groupname !== undefined)
                            throw new Error(`invalid includes expression:${opts.includes}. meet[, but the previous [ is not close. lack of ]?`);
                        groupname = expr.substr(0, at);
                        startAt = at + 1;
                        groupCount++;
                    }
                    else
                        at = 0;
                    at = expr.indexOf(":", startAt);
                    if (at >= 0) {
                        name = expr.substr(0, at).replace(Quic.trimRegx, "");
                        permission = expr.substr(at + 1).replace(Quic.trimRegx, "");
                        if (!permission)
                            throw new Error(`invalid includes expression:${opts.includes}. meet :, but permission is empty.`);
                        ;
                    }
                    else
                        name = expr.substr(startAt).replace(Quic.trimRegx, "");
                    let endGroup = false;
                    if (name[name.length - 1] === "]") {
                        if (!groupname)
                            throw new Error(`invalid includes expression:${opts.includes}. meet ], but not matched [. lack of [?`);
                        ;
                        endGroup = true;
                        name = name.substr(0, name.length - 1);
                    }
                    if (!name)
                        throw new Error(`invalid includes expression:${opts.includes}. Some name is empty.`);
                    if (excludes && Quic.array_index(excludes, name) >= 0)
                        continue;
                    let fieldOpts = { name: name };
                    fieldOpts.permission = permission || opts.defaultPermssion;
                    if (groupname !== undefined) {
                        if (groupname == "")
                            groupname = ' ' + groupCount;
                        fieldOpts.group = groupname;
                    }
                    destFieldOptsSet[name] = fieldOpts;
                }
            }
            else {
                this.fields = opts.includes;
            }
        }
    }
    Quic.Fieldset = Fieldset;
})(Quic || (Quic = {}));
