namespace Quic{
    export interface IPromiseAsync{
        (resolve:(result?:any,invokeByApply?:boolean)=>void,reject?:(err?:any,err_index?:number|string)=>void):void;
    }
    export interface IPromise{
        then(done:(result:any)=>void,error?:(err:any,err_index?:number|string)=>void):IPromise;
        done(done:(result:any)=>void):IPromise;
        fail(error:(err:any,err_index?:number|string)=>void):IPromise;
        resolve?:(result:any,invokeByApply?:boolean) => IPromise;
        reject?:(err:any,err_index?:number|string)=>IPromise;
    }
    interface IPromiseResult{
        value:any;
        err_index?:number|string;
        fullfilled:boolean;
        invokeByApply?:boolean;
    }

    let async_funcs :Array<()=>void>;
    export function async(func:()=>void):void{
        if(!async_funcs){
            async_funcs=[];
            setTimeout(() => {
                let funcs = async_funcs;async_funcs=undefined;
                for(let i=0,j=funcs.length;i<j;i++) funcs.shift()();
            }, 0);
        }
        async_funcs.push(func);return;
    }
    
    export class Promise{
        private __done_handlers__:Array<(result?:any)=>void>;
        private __error_handlers__:Array<(error?:any,err_index?:number|string)=>void>;
        private __promise_result__:IPromiseResult;
        constructor(async_func?:IPromiseAsync|IPromise){
            
            let resolve :(result?:any,invokeByApply?:boolean)=>Promise= (result?:any,invokeByApply?:boolean):Promise=>{
                this.resolve = this.reject = undefined;
                if(result instanceof Promise){
                    (result as Promise).then((result)=>{
                        this.__promise_result__={value:result,invokeByApply:invokeByApply,fullfilled:true};
                        if(this.__done_handlers__) {
                            if(invokeByApply)for(let i=0,j=this.__done_handlers__.length;i<j;i++) this.__done_handlers__.shift().apply(this,result||[]);
                            else for(let i=0,j=this.__done_handlers__.length;i<j;i++) this.__done_handlers__.shift().call(this,result);
                        }
                        this.then =(done:(result?:any)=>void,error?:(err?:any,err_index?:number|string)=>void):Promise=>{
                            if(done){
                                invokeByApply?done.apply(this,result):done.call(this,result||[]);
                            }
                            return this;
                        };
                        this.done = (done:(result?:any)=>void)=>{
                            if(done){
                                invokeByApply?done.apply(this,result):done.call(this,result||[]);
                            }
                            return this;
                        };
                        this.fail = (fail:(err)=>void)=>{return this;};
                    },(err,at)=>{
                        this.__promise_result__={value:result,err_index:at,fullfilled:false};
                        if(this.__error_handlers__) for(let i=0,j=this.__error_handlers__.length;i<j;i++) this.__error_handlers__.shift().call(this,err,at);
                        this.then =(done:(result?:any)=>void,error?:(err?:any,err_index?:number|string)=>void):Promise=>{if(error)error.call(this,err,at);return this;};
                        this.fail = (fail:(err?:any,err_index?:number|string)=>void)=>{if(fail)fail(err,at);return this;};
                        this.done = (done:(result?:any)=>void)=>{return this;};
                    });
                    return this;
                }else{
                    this.then =(done:(result?:any)=>void,error?:(err?:any,err_index?:number | string)=>void):Promise=>{
                        if(done){
                            invokeByApply?done.apply(this,result):done.call(this,result||[]);
                        }
                        return this;
                    };
                    this.done = (done:(result?:any)=>void)=>{
                        if(done){
                            invokeByApply?done.apply(this,result):done.call(this,result||[]);
                        }
                        return this;
                    };
                    this.fail = (fail:(err:any,err_index:number|string)=>void)=>{return this;};
                    return this;
                }
            };
            let reject :(err?:any,at?:number|string)=>Promise=(err?:any,at?:number|string):Promise=>{
                this.__promise_result__={value:err,err_index:at,fullfilled:false};
                if(this.__error_handlers__) for(let i=0,j=this.__error_handlers__.length;i<j;i++) this.__error_handlers__.shift().call(this,err,at);
                this.then =(done:(result?:any)=>void,error?:(err?:any,err_index?:number|string)=>void):Promise=>{if(error)error.call(this,err,at);return this;};
                this.fail = (fail:(err:any,err_index?:number|string)=>void)=>{if(fail)fail.call(this,err,at);return this;};
                this.done = (done:(err)=>void)=>{return this;};
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
        then(done:(result?:any)=>void,error?:(result?:any,err_index?:number|string)=>void):Promise{
            if(done){
                (this.__done_handlers__ ||(this.__done_handlers__=[])).push(done);
            }
            if(error){
                (this.__error_handlers__ ||(this.__error_handlers__=[])).push(error);
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
                (this.__error_handlers__ ||(this.__error_handlers__=[])).push(error);
            } 
            return this;
        }
        resolve?:(result?:any) => Promise;
        reject?:(err?:any,err_index?:number|string)=>Promise;

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