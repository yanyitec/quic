declare var exports;
namespace Quic{
    export interface IPromiseAsync{
        (resolve:(result?:any,invocationWay?:any, ...otherParams)=>void,reject?:(err?:any,err_index?:number|string)=>void):void;
    }
    export interface IPromise{
        then(done:(result:any , ...otherParams)=>void,error?:(reason:any,index_at?:number|string)=>void):IPromise;
        done(done:(result:any, ...otherParams)=>void):IPromise;
        fail(error:(reason:any,index_at?:number|string)=>void):IPromise;
        resolve?:(result:any,invocationWay?:any) => IPromise;
        reject?:(reason:any,index_at?:number|string)=>IPromise;
    }
    interface IPromiseResult{
        value:any;
        index_at?:number|string;
        fullfilled:boolean;
        invocationWay?:any;
    }

    let async_funcs :Array<()=>void>;
    export function async(func:()=>void):void{
        if(!async_funcs){
            async_funcs=[];
            setTimeout(() => {
                let funcs = async_funcs;async_funcs=undefined;
                for(let i=0,j=funcs.length;i<j;i++) funcs.shift()();
                funcs=undefined;
            }, 0);
        }
        async_funcs.push(func);return;
    }

    export class Promise{
        private __done_handlers__:Array<(result?:any)=>void>;
        private __fail_handlers__:Array<(error?:any,err_index?:number|string)=>void>;
        private __promise_result__:IPromiseResult;
        
        constructor(async_func?:IPromiseAsync|IPromise){
            let resolve :(result?:any,invocationWay?:any)=>Promise= (result?:any,invocationWay?:any):Promise => {
                this.resolve = this.reject = undefined;
                if(result instanceof Promise){
                    (result as IPromise).then((result:any,invocationWay:any)=>{
                        resolveResult(self,result,invocationWay);
                    },(reason,index_at)=>{
                        rejectResult(self,reason,index_at);
                    });
                    return this;
                }else{
                    resolveResult(this,result,invocationWay);
                    return this;
                }
            };
            
            let reject :(reason?:any,at?:number|string)=>Promise=(reason?:any,at?:number|string):Promise=>{
                rejectResult(this,reason,at);
                return this;
            }
            if(async_func){
                if( async_func instanceof Promise){
                    resolve(async_func);
                }else {
                    async(()=>{
                        try{
                            (async_func as Function).call(this,resolve,reject);
                        }catch(ex){
                            reject(ex);
                        }
                    });
                }
                
            } else {
                this.resolve = resolve;
                this.reject = reject;
            }
            
        }
        then(done:(result?:any,invocationWay?:any)=>void,error?:(result?:any,err_index?:number|string)=>void):Promise{
            if(done){
                (this.__done_handlers__ ||(this.__done_handlers__=[])).push(done);
            }
            if(error){
                (this.__fail_handlers__ ||(this.__fail_handlers__=[])).push(error);
            }            
            return this;
        }
        done(done:(result?:any,invokeByApply?:boolean)=>void):Promise{
            if(done){
                (this.__done_handlers__ ||(this.__done_handlers__=[])).push(done);
            }
            return this;
        }
        fail(error:(err?:any,err_index?:number|string)=>void):Promise{
            if(error){
                (this.__fail_handlers__ ||(this.__fail_handlers__=[])).push(error);
            } 
            return this;
        }
        resolve?:(result?:any) => Promise;
        reject?:(err?:any,err_index?:number|string)=>Promise;

    }

    let resolveResult = function(self:any,result:any,invocationWay:any ):IPromise{
        self.__promise_result__={value:result,invocationWay:invocationWay,fullfilled:true};
        let handlers = self.__done_handlers__;
        self.__done_handlers__ = self.__done_handlers__=undefined;
        if(invocationWay==="quic::apply"){
            self.then =(done:(result?:any)=>void,error?:(err?:any,err_index?:number|string)=>void):Promise=>{
                if(done){
                    done.apply(this,result||[]);
                }
                return this;
            };
            self.done = (done:(result?:any)=>void)=>{
                if(done){
                    done.apply(this,result||[]);
                }
                return this;
            };
        }else {
            self.then =(done:(result?:any,invocationWay?:any)=>void,error?:(err?:any,err_index?:number|string)=>void):Promise=>{
                if(done){
                    done.call(self,result,invocationWay);
                }
                return this;
            };
            self.done = (done:(result?:any,invocationWay?:any)=>void)=>{
                if(done){
                    done.call(self,result,invocationWay);
                }
                return this;
            };
        }
        
        this.fail = (fail:(reason?:any,index_at?:number|string)=>void)=>{return this;};

        if(handlers) {
            if(invocationWay==="quic::apply"){
                for(let i=0,j=handlers.length;i<j;i++) handlers.shift().apply(self,result||[]);
            }
            else{
                for(let i=0,j=handlers.length;i<j;i++) handlers.shift().call(self,result,invocationWay);
            } 
            self.__done_handlers__ =undefined;
        }
        return self;
    }

    let rejectResult = function(self:any,reason:any,index_at:number|string):IPromise{
        self.__promise_result__={value:reason,index_at:index_at,fullfilled:false};
        let handlers = self.__fail_handlers__;
        self.__fail_handlers__ = self.__done_handlers__=undefined;
        self.then =(done:(result?:any)=>void,error?:(err?:any,err_index?:number|string)=>void):Promise=>{if(error)error.call(this,reason,index_at);return this;};
        self.fail = (fail:(err?:any,err_index?:number|string)=>void)=>{if(fail)fail(reason,index_at);return this;};
        self.done = (done:(result?:any)=>void)=>{return this;};
        if(handlers) for(let i=0,j=handlers.length;i<j;i++) handlers.shift().call(this,reason,index_at);
        return self;
    }

    export function when(...args:Array<IPromiseAsync>):Promise{
        return new Promise(function(resolve,reject):void{
            let count = args.length+1;
            let results :Array<any> = [];
            let error_index:number;
            let loop :(async_func:IPromiseAsync,index:number)=>boolean = (async_func:IPromiseAsync,index:number)=>{
                try{
                    async_func.call(this,(result)=>{
                        if(error_index===undefined){
                            results[index]=result;
                            if(--count===0) resolve.apply(this,results);
                        }
                    },(err)=>{
                        if(error_index===undefined){error_index=index;reject.call(this,err,index);} 
                    });
                    return true;
                }catch(ex){
                    if(error_index===undefined){error_index=index;reject.call(this,ex,index);} 
                    return false;
                }
            };
            for(let i=0,j=args.length;i<j;i++){
                if(loop.call(this,args[i],i)===false) break;
            }
        });
    }
}
exports.Promise = Quic.Promise;
exports.async = Quic.async;
exports.when =Quic.when;