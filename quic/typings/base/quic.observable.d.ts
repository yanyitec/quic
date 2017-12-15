declare namespace Quic {
    interface IObservable {
        subscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        unsubscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        notify(evt: any, applyInvocation?: boolean): any;
    }
    class Observable implements IObservable {
        __event_handlers: any;
        constructor();
        subscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        unsubscribe(nameOrHandler: string | Function, handler?: Function): IObservable;
        notify(nameOrEvtArg: string, evtArgs?: any, applyInvocation?: any): this;
    }
}
