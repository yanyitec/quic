namespace Quic{
    /**
     * 观察者模式中发布者接口定义
     * 
     * @export
     * @interface IObservable
     */
    export interface IObservable{
        /**
         * 提供订阅接口，让订阅者可以注册监听函数
         * 
         * @param {(string|Function)} nameOrHandler  事件名称
         * @param {Function} [handler] 监听函数
         * @returns {IObservable} 发布者自己
         * @memberof IObservable
         */
        subscribe(nameOrHandler:string|Function,handler?:Function):IObservable;
        /**
         * 取消订阅，让订阅者可以取消对某个事件的订阅
         * 
         * @param {(string|Function)} nameOrHandler 事件名称 
         * @param {Function} [handler] 要取消的监听函数
         * @returns {IObservable} 发布者自己
         * @memberof IObservable
         */
        unsubscribe(nameOrHandler:string|Function,handler?:Function):IObservable;
        /**
         * 事件通知函数，给注册的订阅者发送事件通知
         * 其实现为调用注册的监听函数
         * 
         * @param {string} evtname 事件名
         * @param {any} evtargs 事件参数，监听函数会收到该参数
         * @param {any} [applyInvocation] 是否用apply方式调用监听函数。js可以用call/apply两种方式调用函数，apply可以动态设定调用参数的个数，但运行速度比较慢。默认用call
         * @memberof IObservable
         */
        notify(evtname:string,evtargs:any,applyInvocation?:any);
    }
    export class Observable implements IObservable{
        __event_handlers;
        __default_event_handlers;
        constructor(){}
        subscribe(nameOrHandler:string|Function,handler?:Function):IObservable{
            let name :string;
            if(!handler){
                (this.__default_event_handlers || (this.__default_event_handlers=[])).push(nameOrHandler as Function);
                return this;
            }else {
                name = nameOrHandler as string;
            }
            let evts = this.__event_handlers || (this.__event_handlers={});
            let handlers = evts[name] || (evts[name]=[]);
            handlers.push(handler);
            return this;
        }
        unsubscribe(nameOrHandler:string|Function,handler?:Function):IObservable{
            let name :string;
            if(!handler){
                handler = nameOrHandler as Function;
                name = "";
            }else {
                name = nameOrHandler as string;
            }
            let evts ;let handlers:Array<Function>;
            if(name){
                if(!(evts = this.__event_handlers)) return this;
                if(!(handlers= evts[name])) return this;
            }else {
                if(!(handlers = this.__default_event_handlers)) return this;
            }
            
            for(let i =0,j=handlers.length;i<j;i++){
                let h = handlers.shift();
                if(h!==handler) handlers.push(h);
            }
            return this;
        }

        notify(name:string,evtArgs?:any,applyInvocation?:any){
            let evts ;let handlers:Array<Function>;
            if(name){
                if(!(evts = this.__event_handlers)) return this;
                if(name==="quic:all"){
                    for(let evtname in evts){
                        this.notify(evtname,evtArgs,applyInvocation);
                    }
                    return this;
                }
                if(!(handlers= evts[name])) return this;
            }else {
                if(!(handlers = this.__default_event_handlers)) return this;
            }
            
            
            if(applyInvocation==="quic:apply"){
                for(let i =0,j=handlers.length;i<j;i++){
                    let h = handlers.shift();
                    handlers.push(h);
                    h.apply(this,evtArgs||[]);
                }
            }else {
                for(let i =0,j=handlers.length;i<j;i++){
                    let h = handlers.shift();
                    handlers.push(h);
                    h.call(this,evtArgs,applyInvocation);
                }
            }
            
            
            return this;
        }
        
    }
}