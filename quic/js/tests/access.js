var Quic;
(function (Quic) {
    var Tests;
    (function (Tests) {
        function basic() {
            $$TEST.log("basic->test...");
            var data = {
                "prop01": {
                    "prop0101": 201
                }
            };
            var access = Quic.AccessFactory.getOrCreate("prop01.prop0101");
            var value = access(data);
            new $$TEST(value).isEqual(201);
            var supperior = access.superior;
            value = supperior(data);
            new $$TEST(value).isEqual(data.prop01);
            access(data, 200);
            value = access(data);
            new $$TEST(value).isEqual(200);
            $$TEST.log("basic->pass");
        }
        if (require) {
            Quic.AccessFactory = require("../base/quic.access").AccessFactory;
            $$TEST = require("../base/quic.test").$$TEST;
        }
        basic();
    })(Tests || (Tests = {}));
})(Quic || (Quic = {}));
