var Quic;
(function (Quic) {
    var async_funcs;
    function async(func) {
        if (!async_funcs) {
            async_funcs = [];
            setTimeout(function () {
                var funcs = async_funcs;
                async_funcs = undefined;
                for (var i = 0, j = funcs.length; i < j; i++)
                    funcs.shift()();
                funcs = undefined;
            }, 0);
        }
        async_funcs.push(func);
        return;
    }
    Quic.async = async;
    var Promise = /** @class */ (function () {
        function Promise(async_func) {
            var _this = this;
            var resolve = function (result, invocationWay) {
                _this.resolve = _this.reject = undefined; //&& invocationWay!=="quic:value"
                if (result instanceof Promise && result !== _this) {
                    result.then(function (result, invocationWay) {
                        resolveResult(self, result, invocationWay);
                    }, function (reason, index_at) {
                        rejectResult(self, reason, index_at);
                    });
                    return _this;
                }
                else {
                    resolveResult(_this, result, invocationWay);
                    return _this;
                }
            };
            var reject = function (reason, at) {
                rejectResult(_this, reason, at);
                return _this;
            };
            if (async_func) {
                if (async_func instanceof Promise) {
                    resolve(async_func);
                }
                else {
                    async(function () {
                        try {
                            async_func.call(_this, resolve, reject);
                        }
                        catch (ex) {
                            Quic.ctx.error(ex);
                            reject(ex);
                        }
                    });
                }
            }
            else {
                this.resolve = resolve;
                this.reject = reject;
            }
        }
        Promise.prototype.then = function (done, error) {
            if (done) {
                (this.__done_handlers__ || (this.__done_handlers__ = [])).push(done);
            }
            if (error) {
                (this.__fail_handlers__ || (this.__fail_handlers__ = [])).push(error);
            }
            return this;
        };
        Promise.prototype.done = function (done) {
            if (done) {
                (this.__done_handlers__ || (this.__done_handlers__ = [])).push(done);
            }
            return this;
        };
        Promise.prototype.fail = function (error) {
            if (error) {
                (this.__fail_handlers__ || (this.__fail_handlers__ = [])).push(error);
            }
            return this;
        };
        return Promise;
    }());
    Quic.Promise = Promise;
    var resolveResult = function (self, result, invocationWay) {
        var _this = this;
        self.__promise_result__ = { value: result, invocationWay: invocationWay, fullfilled: true };
        var handlers = self.__done_handlers__;
        self.__done_handlers__ = self.__done_handlers__ = undefined;
        if (invocationWay === "quic::apply") {
            self.then = function (done, error) {
                if (done) {
                    done.apply(_this, result || []);
                }
                return _this;
            };
            self.done = function (done) {
                if (done) {
                    done.apply(_this, result || []);
                }
                return _this;
            };
        }
        else {
            self.then = function (done, error) {
                if (done) {
                    done.call(self, result, invocationWay);
                }
                return _this;
            };
            self.done = function (done) {
                if (done) {
                    done.call(self, result, invocationWay);
                }
                return _this;
            };
        }
        this.fail = function (fail) { return _this; };
        if (handlers) {
            if (invocationWay === "quic::apply") {
                for (var i = 0, j = handlers.length; i < j; i++)
                    handlers.shift().apply(self, result || []);
            }
            else {
                for (var i = 0, j = handlers.length; i < j; i++)
                    handlers.shift().call(self, result, invocationWay);
            }
            self.__done_handlers__ = undefined;
        }
        return self;
    };
    var rejectResult = function (self, reason, index_at) {
        var _this = this;
        self.__promise_result__ = { value: reason, index_at: index_at, fullfilled: false };
        var handlers = self.__fail_handlers__;
        self.__fail_handlers__ = self.__done_handlers__ = undefined;
        self.then = function (done, error) { if (error)
            error.call(_this, reason, index_at); return _this; };
        self.fail = function (fail) { if (fail)
            fail(reason, index_at); return _this; };
        self.done = function (done) { return _this; };
        if (handlers)
            for (var i = 0, j = handlers.length; i < j; i++)
                handlers.shift().call(this, reason, index_at);
        return self;
    };
    function when() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var _this = this;
            var count = args.length + 1;
            var results = [];
            var error_index;
            var loop = function (async_func, index) {
                try {
                    async_func.call(_this, function (result) {
                        if (error_index === undefined) {
                            results[index] = result;
                            if (--count === 0)
                                resolve.apply(_this, results);
                        }
                    }, function (err) {
                        if (error_index === undefined) {
                            error_index = index;
                            reject.call(_this, err, index);
                        }
                    });
                    return true;
                }
                catch (ex) {
                    if (error_index === undefined) {
                        error_index = index;
                        reject.call(_this, ex, index);
                    }
                    return false;
                }
            };
            for (var i = 0, j = args.length; i < j; i++) {
                if (loop.call(this, args[i], i) === false)
                    break;
            }
        });
    }
    Quic.when = when;
})(Quic || (Quic = {}));
exports.Promise = Quic.Promise;
exports.async = Quic.async;
exports.when = Quic.when;
