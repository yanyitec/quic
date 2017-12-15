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
            var text = "${prop01.prop0101}&tag=abc";
            Quic.ExpressionFactory.default.accessFactory = Quic.AccessFactory.default;
            var expr = Quic.ExpressionFactory.getOrCreate(text);
            var rs = expr(data, true);
            new $$TEST(rs).isEqual("201&tag=abc");
            $$TEST.log("basic->pass...");
        }
        if (require) {
            Quic.AccessFactory = require("../base/quic.access").AccessFactory;
            Quic.ExpressionFactory = require("../base/quic.expression").ExpressionFactory;
            $$TEST = require("../base/quic.test").$$TEST;
        }
        basic();
    })(Tests || (Tests = {}));
})(Quic || (Quic = {}));
