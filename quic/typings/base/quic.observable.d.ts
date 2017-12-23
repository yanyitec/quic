declare namespace Quic {
    /**
     * 观察者模式中发布者接口定义
     *
     * @export
     * @interface IObservable
     */
    interface IObservable {
        /**
         * 提供订阅接口，让订阅者可以注册监听函数
         *
         * @param {(string|Function)} nameOrHandler  事件名称
         * @param {Function} [handler] 监听函数
         * @returns {IObservable} 发布者自己
         * @memberof IObservable
         */
        subscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        /**
         * 取消订阅，让订阅者可以取消对某个事件的订阅
         *
         * @param {(string|Function)} nameOrHandler 事件名称
         * @param {Function} [handler] 要取消的监听函数
         * @returns {IObservable} 发布者自己
         * @memberof IObservable
         */
        unsubscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        /**
         * 事件通知函数，给注册的订阅者发送事件通知
         * 其实现为调用注册的监听函数
         *
         * @param {string} evtname 事件名
         * @param {any} evtargs 事件参数，监听函数会收到该参数
         * @param {any} [applyInvocation] 是否用apply方式调用监听函数。js可以用call/apply两种方式调用函数，apply可以动态设定调用参数的个数，但运行速度比较慢。默认用call
         * @memberof IObservable
         */
        notify(evtname: string, evtargs: any, applyInvocation?: any): any;
    }
    class Observable implements IObservable {
        __event_handlers: any;
        __default_event_handlers: any;
        constructor();
        subscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        unsubscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        notify(name: string, evtArgs?: any, applyInvocation?: any): this;
    }
}
