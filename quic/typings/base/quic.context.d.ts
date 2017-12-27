/// <reference path="quic.promise.d.ts" />
/// <reference path="quic.transport.d.ts" />
declare namespace Quic {
    /**
     * 环境容器的抽象
     *
     * @export
     * @interface IContext
     */
    interface IContext {
        /**
         * 环境类型
         * browser,node
         * @type {string}
         * @memberof IContext
         */
        type: string;
        /**
         * 跳转浏览器的url
         *
         * @param {string} url 要跳转的url
         * @param {(doc?:HTMLDocument)=>void} complete 跳转完成后的回调??真的可以回调？？？？
         * @memberof IContext
         */
        navigate(url: string, complete: (doc?: HTMLDocument) => void): any;
        /**
         * 调用ajax方法
         *
         * @param {*} opts
         * @returns {*}
         * @memberof IContext
         */
        ajax(opts: any): IPromise;
        /**
         * 加载脚本
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof IContext
         */
        loadScript(url: string, extras?: any): IPromise;
        /**
         * 加载是样表
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof IContext
         */
        loadCss(url: string, extras?: any): IPromise;
        /**
         * 加载文本内容
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof IContext
         */
        loadContent(url: string, extras?: any): IPromise;
        /**
         * 弹出一个警告框，icon为感叹号
         *
         * @param {string} message 要显示的提示信息
         * @param {string} [title] 标题
         * @returns {IPromise}
         * @memberof IContext
         */
        alert(message: string, title?: string): IPromise;
        /**
         * 弹出一个确认框，icon为问号
         *
         * @param {string} message 要显示的确认信息
         * @param {string} [title]
         * @returns {IPromise}
         * @memberof IContext
         */
        confirm(msg: string, title?: string): Promise;
        info: Function;
        /**
         * 对控制台error的抽象
         *
         * @type {Function}
         * @memberof IContext
         */
        error: Function;
        /**
         * 对控制台警告的抽象
         *
         * @type {Function}
         * @memberof IContext
         */
        warn: Function;
        /**
         * 创建Dom元素
         *
         * @param {string} tagName 元素标签
         * @returns {HTMLElement} 创建的元素对象
         * @memberof Dom
         */
        createElement(tagName: string): HTMLElement;
        /**
         * 根据tagName获取文档
         *
         * @param {string} tagName
         * @param {string} context
         * @returns {Array<HTMLElement>}
         * @memberof Dom
         */
        getElementsByTagName(tagName: string, context?: HTMLElement): Array<HTMLElement>;
        /**
         * 给元素添加事件监听
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        attach(element: HTMLElement, evtname: string, listener: Function): void;
        /**
         * 移除元素上的事件监听
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        detach(element: HTMLElement, evtname: string, listener: Function): void;
        /**
         * 给元素添加css
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要添加的css
         * @memberof Dom
         */
        addClass(element: HTMLElement, css: string): void;
        /**
        * 移除元素上的css
        *
        * @param {HTMLElement} element 元素对象
        * @param {string} css 要移除的css
        * @memberof Dom
        */
        removeClass(element: HTMLElement, css: string): void;
        /**
         * 检查元素上是否具有某个css
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要检测的css
         * @returns {boolean} 是否存在
         * @memberof Dom
         */
        hasClass(element: HTMLElement, css: string): any;
        /**
         * 设置/获取某个元素的式样值
         *
         * @param {*} element 元素
         * @param {string} name 式样名
         * @param {string} [value] 式样值.undefined表示获取
         * @returns {*} 获取时，返回式样值
         * @memberof IContext
         */
        style(element: HTMLElement, name: string, value?: string): any;
        /**
         * 设置/获取某个元素的透明度值
         *
         * @param {HTMLElement} element
         * @param {number} [value]
         * @returns {*}
         * @memberof IContext
         */
        opacity(element: HTMLElement, value?: number): any;
        show(element: HTMLElement, animation?: boolean): any;
        hide(element: HTMLElement, animation?: boolean): any;
    }
    class Exception extends Error {
        constructor(message: string, ...args: Array<any>);
    }
    const ctx: IContext;
    const configs: {
        [index: string]: any;
    };
}
