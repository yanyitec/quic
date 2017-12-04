/// <reference path="quic.d.ts" />
/// <reference path="quic.promise.d.ts" />
/// <reference path="quic.utils.d.ts" />
/// <reference path="quic.env.d.ts" />
/// <reference path="quic.dom.d.ts" />
declare namespace Quic {
    class Quic implements IQuic {
        /**
         * 模块名
         *
         * @type {string}
         * @memberof IQuic
         */
        name: string;
        /**
         * 字段集合
         *
         * @type {IFieldset}
         * @memberof IQuic
         */
        fieldset: IFieldset;
        /**
         * 数据访问器工厂
         *
         * @type {IAccessFactory}
         * @memberof IQuic
         */
        accessFactory: IAccessFactory;
        renderers: {
            [index: string]: IRenderer;
        };
        /**
         * 事件集合 viewname/fieldname/evtname
         * 从controller中分析出来
         * @type {[viewname:string]:any}
         * @memberof IQuic
         */
        events: {
            [viewname: string]: any;
        };
        /**
         * 控制器
         *
         * @type {(IController|Function)}
         * @memberof IQuic
         */
        controller: IController | Function;
        langs: {
            [key: string]: string;
        };
        /**
         * 需要额外销毁的资源
         *
         * @type {Array<IDisposable>}
         * @memberof IQuic
         */
        resources: Array<IDisposable>;
        _readies: Array<(module: IQuic) => void>;
        constructor();
        _T(key: string, mustReturn?: boolean): string;
        ready(handler: (module: Quic) => void): void;
        init(opts: QuicOpts): void;
        /**
         * 获取事件监听器
         *
         * @param {string} evtName 事件名
         * @param {string} [viewname] 视图名，默认为viewset的
         * @returns {*}
         * @memberof IQuic
         */
        getEventListener(evtName: string, viewname?: string): any;
        /**
         * 根据permission获取呈现器
         *
         * @param {string} viewType
         * @returns {IRenderer}
         * @memberof IQuic
         */
        findRenderer(viewType: string): IRenderer;
    }
    let cached_modules: {
        [name: string]: Quic;
    };
}
