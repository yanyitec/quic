var Quic;
(function (Quic) {
    var QuicModule = /** @class */ (function () {
        function QuicModule() {
            this._readies = [];
        }
        QuicModule.prototype._T = function (key, mustReturn) {
            var text;
            if (this.langs)
                text = this.langs[key];
            if (text === undefined)
                text = Quic.langs[key];
            if (text === undefined && mustReturn === true)
                key;
            return text;
        };
        QuicModule.prototype.ready = function (handler) {
            this._readies.push(handler);
        };
        QuicModule.prototype.init = function (opts) {
            var _this = this;
            for (var i = 0, j = this._readies.length; i < j; i++) {
                this._readies[i](this);
            }
            this._readies = undefined;
            this.ready = function (handler) {
                handler(_this);
            };
        };
        /**
         * 获取事件监听器
         *
         * @param {string} evtName 事件名
         * @param {string} [viewname] 视图名，默认为viewset的
         * @returns {*}
         * @memberof IQuic
         */
        QuicModule.prototype.getEventListener = function (evtName, viewname) {
        };
        /**
         * 根据permission获取呈现器
         *
         * @param {string} viewType
         * @returns {IRenderer}
         * @memberof IQuic
         */
        QuicModule.prototype.findRenderer = function (viewType) {
            var result;
            return this.renderers[viewType] || Quic.renderers[viewType];
        };
        return QuicModule;
    }());
    Quic.QuicModule = QuicModule;
    Quic.cached_modules = {};
    var loadQuic = function (name, comlete) {
        var module = Quic.cached_modules[name];
        if (!module)
            module = Quic.cached_modules[name] = new QuicModule();
        //module.ready(comlete);
        return module;
    };
})(Quic || (Quic = {}));
