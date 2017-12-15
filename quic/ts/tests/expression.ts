declare var $$TEST;
declare var require;

namespace Quic{
    namespace Tests{
        function basic(){
            $$TEST.log("basic->test...");
            let data :any = {
                "prop01":{
                    "name":"yiy",
                    "prop0101":201
                },
                "i":12
            };
            let text = "${prop01.prop0101}&tag=abc";
            (ExpressionFactory.default as any).accessFactory = Quic.AccessFactory.default;
            let expr = ExpressionFactory.getOrCreate(text);
            let rs = expr(data,true);
            new $$TEST(rs).isEqual("201&tag=abc");
            text = "name=yanyi&count=${prop01.prop0101 + i}&tag=${prop01.name}";
            expr = ExpressionFactory.getOrCreate(text);
            rs = expr(data,true);
            new $$TEST(rs).isEqual("name=yanyi&count=213&tag=yiy");

            $$TEST.log("basic->pass...");
        }

        if(require){
            Quic.AccessFactory = require("../base/quic.access").AccessFactory;
            Quic.ExpressionFactory = require("../base/quic.expression").ExpressionFactory;
            $$TEST = require("../base/quic.test").$$TEST;
        } 
        basic();
    }
}