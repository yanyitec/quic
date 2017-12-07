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
        function arr() {
            $$TEST.log("arr->test...");
            var data = [1, {
                    "prop": [1, 2, "yes", 3]
                }];
            var access = Quic.AccessFactory.getOrCreate("[1].prop[2]");
            var value = access(data);
            new $$TEST(value).isEqual("yes");
            access(data, 200);
            new $$TEST(data[1].prop[2]).isEqual(200);
            var supperior = access.superior;
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
        if (require) {
            Quic.AccessFactory = require("../base/quic.access").AccessFactory;
            $$TEST = require("../base/quic.test").$$TEST;
        }
        basic();
        arr();
    })(Tests || (Tests = {}));
})(Quic || (Quic = {}));
