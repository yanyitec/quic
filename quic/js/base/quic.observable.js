var Quic;
(function (Quic) {
    var Observable = /** @class */ (function () {
        function Observable() {
        }
        Observable.prototype.subscribe = function (nameOrHandler, handler) {
            var name;
            if (!handler) {
                (this.__default_event_handlers || (this.__default_event_handlers = [])).push(nameOrHandler);
                return this;
            }
            else {
                name = nameOrHandler;
            }
            var evts = this.__event_handlers || (this.__event_handlers = {});
            var handlers = evts[name] || (evts[name] = []);
            handlers.push(handler);
            return this;
        };
        Observable.prototype.unsubscribe = function (nameOrHandler, handler) {
            var name;
            if (!handler) {
                handler = nameOrHandler;
                name = "";
            }
            else {
                name = nameOrHandler;
            }
            var evts;
            var handlers;
            if (name) {
                if (!(evts = this.__event_handlers))
                    return this;
                if (!(handlers = evts[name]))
                    return this;
            }
            else {
                if (!(handlers = this.__default_event_handlers))
                    return this;
            }
            for (var i = 0, j = handlers.length; i < j; i++) {
                var h = handlers.shift();
                if (h !== handler)
                    handlers.push(h);
            }
            return this;
        };
        Observable.prototype.notify = function (name, evtArgs, applyInvocation) {
            var evts;
            var handlers;
            if (name) {
                if (!(evts = this.__event_handlers))
                    return this;
                if (name === "quic:all") {
                    for (var evtname in evts) {
                        this.notify(evtname, evtArgs, applyInvocation);
                    }
                    return this;
                }
                if (!(handlers = evts[name]))
                    return this;
            }
            else {
                if (!(handlers = this.__default_event_handlers))
                    return this;
            }
            if (applyInvocation === "quic:apply") {
                for (var i = 0, j = handlers.length; i < j; i++) {
                    var h = handlers.shift();
                    handlers.push(h);
                    h.apply(this, evtArgs || []);
                }
            }
            else {
                for (var i = 0, j = handlers.length; i < j; i++) {
                    var h = handlers.shift();
                    handlers.push(h);
                    h.call(this, evtArgs, applyInvocation);
                }
            }
            return this;
        };
        return Observable;
    }());
    Quic.Observable = Observable;
})(Quic || (Quic = {}));
