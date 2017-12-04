/// <reference path="quic.d.ts" />
declare namespace Quic {
    /**
     * 环境容器的抽象
     *
     * @export
     * @interface Env
     */
    interface Env {
        /**
         * 环境类型
         * browser,node
         * @type {string}
         * @memberof Env
         */
        type: string;
        /**
         * 跳转浏览器的url
         *
         * @param {string} url 要跳转的url
         * @param {(doc?:HTMLDocument)=>void} complete 跳转完成后的回调??真的可以回调？？？？
         * @memberof Env
         */
        navigate(url: string, complete: (doc?: HTMLDocument) => void): any;
        /**
         * 调用ajax方法
         *
         * @param {*} opts
         * @returns {*}
         * @memberof Env
         */
        ajax(opts: any): IPromise;
        /**
         * 加载脚本
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof Env
         */
        loadScript(url: string, extras?: any): IPromise;
        /**
         * 加载是样表
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof Env
         */
        loadCss(url: string, extras?: any): IPromise;
        /**
         * 加载文本内容
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof Env
         */
        loadContent(url: string, extras?: any): IPromise;
        /**
         * 弹出一个警告框，icon为感叹号
         *
         * @param {string} message 要显示的提示信息
         * @param {string} [title] 标题
         * @returns {IPromise}
         * @memberof Env
         */
        alert(message: string, title?: string): IPromise;
        /**
         * 弹出一个确认框，icon为问号
         *
         * @param {string} message 要显示的确认信息
         * @param {string} [title]
         * @returns {IPromise}
         * @memberof Env
         */
        confirm(msg: string, title?: string): Promise;
        /**
         * 记录错误并扔出异常Error
         *
         * @type {Function}
         * @memberof Env
         */
        throw: Function;
        /**
         * 对控制台error的抽象
         *
         * @type {Function}
         * @memberof Env
         */
        error: Function;
        /**
         * 对控制台警告的抽象
         *
         * @type {Function}
         * @memberof Env
         */
        warn: Function;
    }
    let env: Env;
}
