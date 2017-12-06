var Quic;
(function (Quic) {
    var Tests;
    (function (Tests) {
        function promise_resolve() {
            $$TEST.log("promise_resolve->test");
            var resolveValue, invocation;
            var resolveErr, resolveAt;
            var promise = new Quic.Promise(function (resolve, reject) {
                resolve(12, 13);
            });
            promise.done(function (value, inv) {
                resolveValue = value;
                invocation = inv;
            }).fail(function (e, at) {
                resolveErr = e;
                resolveAt = at;
            });
            new $$TEST(resolveValue).isUndefined();
            new $$TEST(invocation).isUndefined();
            new $$TEST(resolveErr).isUndefined();
            new $$TEST(resolveAt).isUndefined();
            setTimeout(function () {
                new $$TEST(resolveValue).isSame(12);
                new $$TEST(invocation).isSame(13);
                new $$TEST(resolveErr).isUndefined();
                new $$TEST(resolveAt).isUndefined();
                var secondv, secondi;
                promise.done(function (s, i) {
                    secondv = s;
                    secondi = i;
                });
                new $$TEST(secondv).isSame(12);
                new $$TEST(secondi).isSame(13);
                $$TEST.log("promise_resolve->success");
            }, 200);
        }
        function promise_reject() {
            $$TEST.log("promise_reject->test");
            var resolveValue, invocation;
            var resolveErr, resolveAt;
            var promise = new Quic.Promise(function (resolve, reject) {
                reject("dd", "rr");
            });
            promise.done(function (value, inv) {
                resolveValue = value;
                invocation = inv;
            }).fail(function (e, at) {
                resolveErr = e;
                resolveAt = at;
            });
            new $$TEST(resolveValue).isUndefined();
            new $$TEST(invocation).isUndefined();
            new $$TEST(resolveErr).isUndefined();
            new $$TEST(resolveAt).isUndefined();
            setTimeout(function () {
                new $$TEST(resolveErr).isSame("dd");
                new $$TEST(resolveAt).isSame("rr");
                new $$TEST(resolveValue).isUndefined();
                new $$TEST(invocation).isUndefined();
                var secondv, secondi;
                promise.fail(function (s, i) {
                    secondv = s;
                    secondi = i;
                });
                new $$TEST(secondv).isSame("dd");
                new $$TEST(secondi).isSame("rr");
                $$TEST.log("promise_reject->success");
            }, 200);
        }
        if (require) {
            Quic.Promise = require("../base/quic.promise").Promise;
            $$TEST = require("../base/quic.test").$$TEST;
        }
        promise_resolve();
        promise_reject();
    })(Tests || (Tests = {}));
})(Quic || (Quic = {}));
