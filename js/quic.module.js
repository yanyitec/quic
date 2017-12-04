/// <reference path="quic.ts" />
/// <reference path="quic.promise.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic_1) {
    var Quic = /** @class */ (function () {
        function Quic() {
            this._readies = [];
        }
        Quic.prototype._T = function (key, mustReturn) {
            var text;
            if (this.langs)
                text = this.langs[key];
            if (text === undefined)
                text = Quic_1.langs[key];
            if (text === undefined && mustReturn === true)
                key;
            return text;
        };
        Quic.prototype.ready = function (handler) {
            this._readies.push(handler);
        };
        Quic.prototype.init = function (opts) {
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
        Quic.prototype.getEventListener = function (evtName, viewname) {
        };
        /**
         * 根据permission获取呈现器
         *
         * @param {string} viewType
         * @returns {IRenderer}
         * @memberof IQuic
         */
        Quic.prototype.findRenderer = function (viewType) {
            var result;
            return this.renderers[viewType] || Quic_1.renderers[viewType];
        };
        return Quic;
    }());
    Quic_1.Quic = Quic;
    Quic_1.cached_modules = {};
    var loadQuic = function (name, comlete) {
        var module = Quic_1.cached_modules[name];
        if (!module)
            module = Quic_1.cached_modules[name] = new Quic();
        module.ready(comlete);
        return module;
    };
})(Quic || (Quic = {}));
