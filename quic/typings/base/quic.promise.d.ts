declare var exports: any;
declare namespace Quic {
    interface IPromiseAsync {
        (resolve: (result?: any, invocationWay?: any, ...otherParams) => void, reject?: (err?: any, err_index?: number | string) => void): void;
    }
    interface IPromise {
        then(done: (result: any, ...otherParams) => void, error?: (reason: any, index_at?: number | string) => void): IPromise;
        done(done: (result: any, ...otherParams) => void): IPromise;
        fail(error: (reason: any, index_at?: number | string) => void): IPromise;
        resolve?: (result: any, invocationWay?: any) => IPromise;
        reject?: (reason: any, index_at?: number | string) => IPromise;
    }
    function async(func: () => void): void;
    class Promise {
        private __done_handlers__;
        private __fail_handlers__;
        private __promise_result__;
        constructor(async_func?: IPromiseAsync | IPromise);
        then(done: (result?: any, invocationWay?: any) => void, error?: (result?: any, err_index?: number | string) => void): Promise;
        done(done: (result?: any, invokeByApply?: boolean) => void): Promise;
        fail(error: (err?: any, err_index?: number | string) => void): Promise;
        resolve?: (result?: any) => Promise;
        reject?: (err?: any, err_index?: number | string) => Promise;
    }
    function when(...args: Array<IPromiseAsync>): Promise;
}
