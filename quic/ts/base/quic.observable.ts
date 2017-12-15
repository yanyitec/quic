namespace Quic{
    export interface IObservable{
        subscribe(nameOrHandler:string|Function,handler?:Function):IObservable;
        unsubscribe(nameOrHandler:string|Function,handler?:Function):IObservable;
        notify(evt:any,applyInvocation?:boolean);
    }
    export class Observable implements IObservable{
        __event_handlers;
        constructor(){}
        subscribe(nameOrHandler:string|Function,handler?:Function):IObservable{
            let name :string;
            if(!handler){
                handler = nameOrHandler as Function;
                name = "";
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
            if(!(evts = this.__event_handlers)) return this;
            if(!(handlers= evts[name])) return this;
            for(let i =0,j=handlers.length;i<j;i++){
                let h = handlers.shift();
                if(h!==handler) handlers.push(h);
            }
            return this;
        }

        notify(nameOrEvtArg:string,evtArgs?:any,applyInvocation?:any){
            let evts ;let handlers:Array<Function>;
            if(!(evts = this.__event_handlers)) return this;
            if(!(handlers= evts[name])) return this;
            if(applyInvocation==="quic::apply"){
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