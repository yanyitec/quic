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
            let access:IDataAccess = AccessFactory.getOrCreate("prop01.prop0101");
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
        
        

        if(require){
            Quic.AccessFactory = require("../base/quic.access").AccessFactory;

            $$TEST = require("../base/quic.test").$$TEST;
        } 
        basic();
    }
}