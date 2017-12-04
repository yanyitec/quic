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
            }, 0);
        }
        async_funcs.push(func);
        return;
    }
    Quic.async = async;
    var Promise = /** @class */ (function () {
        function Promise(async_func) {
            var _this = this;
            var resolve = function (result, invokeByApply) {
                _this.resolve = _this.reject = undefined;
                if (result instanceof Promise) {
                    result.then(function (result) {
                        _this.__promise_result__ = { value: result, invokeByApply: invokeByApply, fullfilled: true };
                        if (_this.__done_handlers__) {
                            if (invokeByApply)
                                for (var i = 0, j = _this.__done_handlers__.length; i < j; i++)
                                    _this.__done_handlers__.shift().apply(_this, result || []);
                            else
                                for (var i = 0, j = _this.__done_handlers__.length; i < j; i++)
                                    _this.__done_handlers__.shift().call(_this, result);
                        }
                        _this.then = function (done, error) {
                            if (done) {
                                invokeByApply ? done.apply(_this, result) : done.call(_this, result || []);
                            }
                            return _this;
                        };
                        _this.done = function (done) {
                            if (done) {
                                invokeByApply ? done.apply(_this, result) : done.call(_this, result || []);
                            }
                            return _this;
                        };
                        _this.fail = function (fail) { return _this; };
                    }, function (err, at) {
                        _this.__promise_result__ = { value: result, err_index: at, fullfilled: false };
                        if (_this.__error_handlers__)
                            for (var i = 0, j = _this.__error_handlers__.length; i < j; i++)
                                _this.__error_handlers__.shift().call(_this, err, at);
                        _this.then = function (done, error) { if (error)
                            error.call(_this, err, at); return _this; };
                        _this.fail = function (fail) { if (fail)
                            fail(err, at); return _this; };
                        _this.done = function (done) { return _this; };
                    });
                    return _this;
                }
                else {
                    _this.then = function (done, error) {
                        if (done) {
                            invokeByApply ? done.apply(_this, result) : done.call(_this, result || []);
                        }
                        return _this;
                    };
                    _this.done = function (done) {
                        if (done) {
                            invokeByApply ? done.apply(_this, result) : done.call(_this, result || []);
                        }
                        return _this;
                    };
                    _this.fail = function (fail) { return _this; };
                    return _this;
                }
            };
            var reject = function (err, at) {
                _this.__promise_result__ = { value: err, err_index: at, fullfilled: false };
                if (_this.__error_handlers__)
                    for (var i = 0, j = _this.__error_handlers__.length; i < j; i++)
                        _this.__error_handlers__.shift().call(_this, err, at);
                _this.then = function (done, error) { if (error)
                    error.call(_this, err, at); return _this; };
                _this.fail = function (fail) { if (fail)
                    fail.call(_this, err, at); return _this; };
                _this.done = function (done) { return _this; };
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
                (this.__error_handlers__ || (this.__error_handlers__ = [])).push(error);
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
                (this.__error_handlers__ || (this.__error_handlers__ = [])).push(error);
            }
            return this;
        };
        return Promise;
    }());
    Quic.Promise = Promise;
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
