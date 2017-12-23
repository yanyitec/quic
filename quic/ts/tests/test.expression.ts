/// <reference path="../models/quic.expression.ts" />
declare var $$TEST;
declare var require;

namespace Quic{
    namespace Tests{
        function member(){
            $$TEST.log("quic.expression[member]->test");
            let expr:string = "abc.def";
            let members = new Quic.Models.MemberAccessParser(expr).members;
            new $$TEST(members).isExists().length(2);
            new $$TEST(members[0]).prop("name","abc").prop("isIndex",false);
            new $$TEST(members[1]).prop("name","def").prop("isIndex",false);
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

        function expr(){
            $$TEST.log("quic.expression[expr]->test");
            let expr = "abc.def${ok}${alias[0] +'\"' + No[0].def}";
            let exprs = new Quic.Models.ExpressionParser(expr).exprs;
            
            $$TEST.log("quic.expression[member]->pass");
        }

        

        if(require){
            ((Quic.Models || ((Quic as any).Models={})) as any).Expression =  require("../models/quic.expression").Expression;
            ((Quic.Models || ((Quic as any).Models={})) as any).ExpressionParser = require("../models/quic.expression").ExpressionParser;
            ((Quic.Models || ((Quic as any).Models={})) as any).MemberAccessParser = require("../models/quic.expression").MemberAccessParser;
            
            $$TEST = require("../base/quic.test").$$TEST;
        } 
        
        //member();
        expr();
    }
}