var Quic;
(function (Quic) {
    var ExpressionFactory = /** @class */ (function () {
        function ExpressionFactory(accessFactory) {
            this.caches = {};
            this.accessFactory = accessFactory;
            if (!this.accessFactory && Quic.AccessFactory) {
                this.accessFactory = Quic.AccessFactory.default;
            }
        }
        ExpressionFactory.prototype.getOrCreate = function (text) {
            var expr = this.caches[text] || ExpressionFactory.create(text, this.accessFactory);
            return expr;
        };
        ExpressionFactory.getOrCreate = function (text) {
            return ExpressionFactory.default.getOrCreate(text);
        };
        ExpressionFactory.create = function (text, accessFactory) {
            var rs;
            var mappathRs;
            var deps = [];
            var at = 0;
            var outerCode = "";
            var onlyMappathCount = 0;
            var constText;
            var code = "\tvar $__RESULT__='';var $__MID_RESULT__;\n";
            while (rs = computedRegx.exec(text)) {
                var computedText = rs[0].substring(2, rs[0].length - 1);
                constText = text.substring(at, rs.index);
                at += rs.index + rs[0].length;
                if (constText !== "") {
                    code += "\t\t$__RESULT__ +=\"" + constText.replace(/"/g, "\\\"") + "\";\n";
                }
                var mappath = void 0;
                while (mappathRs = regex.exec(computedText)) {
                    mappath = mappathRs[0];
                    deps.push(accessFactory.getOrCreate(mappath));
                }
                if (mappath.length === computedText.length) {
                    outerCode += "var $_ACCESSOR_" + onlyMappathCount + "=$__ACCESSFACTORY__.getOrCreate(\"" + mappath + "\");\n";
                    code += "\t\t$__MID_RESULT__ = $_ACCESSOR_" + (onlyMappathCount++) + "($__DATA__);\n";
                    code += "\t\tif(!$EMPTYERROR || ($__MID_RESULT__!==undefined && $__MID_RESULT__!==null)) {$__RESULT__+=$__MID_RESULT__;}\n";
                }
                else {
                    code += "\n        try{\n            $__RESULT__ += (function($__DATA__){\n                with($__DATA__){\n                    return " + computedText + ";\n                }\n            })($__DATA__);\n        }catch($__EXCEPTION__){\n                Quic.ctx.warn(\"expression error\",$__EXCEPTION__);\n                $__RESULT__ += $EMPTYERROR?\"\":$__EXCEPTION__.toString();\n        }\n";
                }
            }
            constText = text.substring(at);
            if (constText !== "") {
                code += "\t$__RESULT__ +=\"" + constText.replace(/"/g, "\\\"") + "\";\n";
            }
            code += "\treturn $__RESULT__;\n";
            var result;
            if (onlyMappathCount === 0) {
                result = new Function("$__DATA__", "$EMPTYERROR", code);
            }
            else {
                outerCode += "return function($__DATA__,$EMPTYERROR){\n" + code + "};";
                result = new Function("$__ACCESSFACTORY__", outerCode)(accessFactory);
            }
            result.deps = deps;
            result.text = text;
            return result;
        };
        ExpressionFactory.default = new ExpressionFactory();
        return ExpressionFactory;
    }());
    Quic.ExpressionFactory = ExpressionFactory;
    var computedRegx = /\$\{[^\}]+\}/g;
    var arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
    var propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
    var regt = "(?:" + arrSectionRegt + "|" + propSectionRegt + ")(?:" + arrSectionRegt + "|(?:." + propSectionRegt + "))*";
    var regex = new RegExp(regt, "g");
})(Quic || (Quic = {}));
exports.ExpressionFactory = Quic.ExpressionFactory;
