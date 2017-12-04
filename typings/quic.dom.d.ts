declare namespace Quic {
    /**
     * 对DOM操作的抽象
     * env.type===browser，就是HTMLElement
     * env.type===node,就是虚拟节点(待实现)
     * @export
     * @interface Dom
     */
    interface Dom {
        type: string;
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
         * @param {string} css
         * @memberof Dom
         */
        hasClass(element: HTMLElement, css: string): any;
    }
    let dom: Dom;
}
