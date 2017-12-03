var Quic;
(function (Quic) {
    let async_funcs;
    function async(func) {
        if (!async_funcs) {
            async_funcs = [];
            setTimeout(() => {
                let funcs = async_funcs;
                async_funcs = undefined;
                for (let i = 0, j = funcs.length; i < j; i++)
                    funcs.shift()();
            }, 0);
        }
        async_funcs.push(func);
        return;
    }
    Quic.async = async;
    class Promise {
        constructor(async_func) {
            let resolve = (result) => {
                if (result instanceof Promise) {
                    result.then((result) => {
                        if (this.__done_handlers__)
                            for (let i = 0, j = this.__done_handlers__.length; i < j; i++)
                                this.__done_handlers__.shift().call(this, result);
                        this.then = (done, error) => { if (done)
                            done.call(this, result); return this; };
                        this.done = (done) => { if (done)
                            done.call(this, result); return this; };
                        this.reject = (reject) => { return this; };
                    }, (err) => {
                        if (this.__error_handlers__)
                            for (let i = 0, j = this.__error_handlers__.length; i < j; i++)
                                this.__error_handlers__.shift().call(this, err);
                        this.then = (done, error) => { if (error)
                            error.call(this, err); return this; };
                        this.reject = (reject) => { if (reject)
                            reject.call(this, err); return this; };
                        this.done = (done) => { return this; };
                    });
                    return this;
                }
                else {
                    this.then = (done, error) => { if (done)
                        done.call(this, result); return this; };
                    this.done = (done) => { if (done)
                        done.call(this, result); return this; };
                    this.reject = (reject) => { return this; };
                    return this;
                }
            };
            let reject = (err) => {
                if (this.__error_handlers__)
                    for (let i = 0, j = this.__error_handlers__.length; i < j; i++)
                        this.__error_handlers__.shift().call(this, err);
                this.then = (done, error) => { if (error)
                    error.call(this, err); return this; };
                this.reject = (reject) => { if (reject)
                    reject.call(this, err); return this; };
                this.done = (done) => { return this; };
                return this;
            };
            if (async_func) {
                async(() => {
                    try {
                        async_func.call(this, resolve, reject);
                    }
                    catch (ex) {
                    }
                });
            }
            else {
                this.resolve = resolve;
                this.reject = reject;
            }
        }
        then(done, error) {
            if (done) {
                (this.__done_handlers__ || (this.__done_handlers__ = [])).push(done);
            }
            if (error) {
                (this.__error_handlers__ || (this.__error_handlers__ = [])).push(error);
            }
            return this;
        }
        done(done) {
            if (done) {
                (this.__done_handlers__ || (this.__done_handlers__ = [])).push(done);
            }
            return this;
        }
        error(error) {
            if (error) {
                (this.__error_handlers__ || (this.__error_handlers__ = [])).push(error);
            }
            return this;
        }
    }
    Quic.Promise = Promise;
    function when(...args) {
        return new Promise(function (resolve, reject) {
            let count = args.length + 1;
            let results = [];
            let error_index;
            let loop = (async_func, index) => {
                try {
                    async_func.call(this, (result) => {
                        if (error_index === undefined) {
                            results[index] = result;
                            if (--count === 0)
                                resolve.apply(this, results);
                        }
                    }, (err) => {
                        if (error_index === undefined) {
                            error_index = index;
                            reject.call(this, err, index);
                        }
                    });
                    return true;
                }
                catch (ex) {
                    if (error_index === undefined) {
                        error_index = index;
                        reject.call(this, ex, index);
                    }
                    return false;
                }
            };
            for (let i = 0, j = args.length; i < j; i++) {
                if (loop.call(this, args[i], i) === false)
                    break;
            }
        });
    }
})(Quic || (Quic = {}));
