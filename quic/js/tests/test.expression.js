/// <reference path="../models/quic.expression.ts" />
var Quic;
(function (Quic) {
    var Tests;
    (function (Tests) {
        function member() {
            $$TEST.log("quic.expression[member]->test");
            var expr = "abc.def";
            var members = new Quic.Models.MemberAccessParser(expr).members;
            new $$TEST(members).isExists().length(2);
            new $$TEST(members[0]).prop("name", "abc").prop("isIndex", false);
            new $$TEST(members[1]).prop("name", "def").prop("isIndex", false);
            expr = "[].abc[2][5].def";
            members = new Quic.Models.MemberAccessParser(expr).members;
            new $$TEST(members).isExists().length(5);
            new $$TEST(members[0]).prop("name", "").prop("isIndex", true);
            new $$TEST(members[1]).prop("name", "abc").prop("isIndex", false);
            new $$TEST(members[2]).prop("name", "2").prop("isIndex", true);
            new $$TEST(members[3]).prop("name", "5").prop("isIndex", true);
            new $$TEST(members[4]).prop("name", "def").prop("isIndex", false);
            expr = "def[2]";
            members = new Quic.Models.MemberAccessParser(expr).members;
            $$TEST.log("quic.expression[member]->pass");
        }
        function expr() {
            $$TEST.log("quic.expression[expr]->test");
            var expr = "abc.def${ok}${alias[0] +'\"' + No[0].def}";
            var exprs = new Quic.Models.ExpressionParser(expr).exprs;
            new $$TEST(exprs[0]).instanceOf(Quic.Models.Expression.ConstExpression);
            new $$TEST(exprs[0].text).isEqual("abc.def");
            new $$TEST(exprs[1]).instanceOf(Quic.Models.Expression.ComputedExpression);
            new $$TEST(exprs[1].path).hasValue();
            $$TEST.log("quic.expression[member]->pass");
        }
        if (require) {
            (Quic.Models || (Quic.Models = {})).Expression = require("../models/quic.expression").Expression;
            (Quic.Models || (Quic.Models = {})).ExpressionParser = require("../models/quic.expression").ExpressionParser;
            (Quic.Models || (Quic.Models = {})).MemberAccessParser = require("../models/quic.expression").MemberAccessParser;
            $$TEST = require("../base/quic.test").$$TEST;
        }
        //member();
        expr();
    })(Tests || (Tests = {}));
})(Quic || (Quic = {}));
