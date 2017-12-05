declare namespace Quic {
    interface IPromiseAsync {
        (resolve: (result?: any, invokeByApply?: boolean) => void, reject?: (err?: any, err_index?: number | string) => void): void;
    }
    interface IPromise {
        then(done: (result: any) => void, error?: (err: any, err_index?: number | string) => void): IPromise;
        done(done: (result: any) => void): IPromise;
        fail(error: (err: any, err_index?: number | string) => void): IPromise;
        resolve?: (result: any, invokeByApply?: boolean) => IPromise;
        reject?: (err: any, err_index?: number | string) => IPromise;
    }
    function async(func: () => void): void;
    class Promise {
        private __done_handlers__;
        private __error_handlers__;
        private __promise_result__;
        constructor(async_func?: IPromiseAsync | IPromise);
        then(done: (result?: any) => void, error?: (result?: any, err_index?: number | string) => void): Promise;
        done(done: (result?: any, invokeByApply?: boolean) => void): Promise;
        fail(error: (err?: any, err_index?: number | string) => void): Promise;
        resolve?: (result?: any) => Promise;
        reject?: (err?: any, err_index?: number | string) => Promise;
    }
    function when(...args: Array<IPromiseAsync>): Promise;
}
