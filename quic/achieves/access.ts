declare var $$TEST;
declare var require;

namespace Quic{
    namespace Tests{
        function basic(){
            $$TEST.log("basic->test...");
            let data :any = {
                "prop01":{
                    "prop0101":201
                }
            };
            //"#data"
            let access:IAccess = AccessFactory.getOrCreate("prop01.prop0101");
            let value = access(data);
            new $$TEST(value).isEqual(201);

            let supperior = access.superior;
            value = supperior(data);
            new $$TEST(value).isEqual(data.prop01);

            access(data,200);
            value = access(data);
            new $$TEST(value).isEqual(200);
            $$TEST.log("basic->pass");
        }

        function arr(){
            $$TEST.log("arr->test...");
            let data :any = [1,{
                "prop":[1,2,"yes",3]
            }];
            let access:IAccess = AccessFactory.getOrCreate("[1].prop[2]");
            let value = access(data);
            new $$TEST(value).isEqual("yes");
            access(data,200);
            new $$TEST(data[1].prop[2]).isEqual(200);

            let supperior = access.superior;
            value = supperior(data);
            new $$TEST(value).isEqual(data[1].prop);

            supperior = supperior.superior;
            value = supperior(data);
            new $$TEST(value).isEqual(data[1]);

            supperior = supperior.superior;
            value = supperior(data);
            new $$TEST(value).isEqual(data);

            $$TEST.log("arr->pass");
        }
        
        
        

        if(require){
            Quic.AccessFactory = require("../data/quic.access").AccessFactory;

            $$TEST = require("../base/quic.test").$$TEST;
        } 
        basic();
        arr();
    }
}