/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic) {
    class Module {
        constructor() {
            this._readies = [];
        }
        _T(key, mustReturn) {
            let text;
            if (this.langs)
                text = this.langs[key];
            if (text === undefined)
                text = Quic.langs[key];
            if (text === undefined && mustReturn === true)
                key;
            return text;
        }
        ready(handler) {
            this._readies.push(handler);
        }
        init(opts) {
            for (let i = 0, j = this._readies.length; i < j; i++) {
                this._readies[i](this);
            }
            this._readies = undefined;
            this.ready = (handler) => {
                handler(this);
            };
        }
        /**
         * 获取事件监听器
         *
         * @param {string} evtName 事件名
         * @param {string} [viewname] 视图名，默认为viewset的
         * @returns {*}
         * @memberof IModule
         */
        getEventListener(evtName, viewname) {
        }
        /**
         * 根据permission获取呈现器
         *
         * @param {string} viewType
         * @returns {IRenderer}
         * @memberof IModule
         */
        findRenderer(viewType) {
            let result;
            return this.renderers[viewType] || Quic.renderers[viewType];
        }
    }
    Quic.Module = Module;
    Quic.cached_modules = {};
    let loadModule = (name, comlete) => {
        let module = Quic.cached_modules[name];
        if (!module)
            module = Quic.cached_modules[name] = new Module();
        module.ready(comlete);
        return module;
    };
})(Quic || (Quic = {}));
