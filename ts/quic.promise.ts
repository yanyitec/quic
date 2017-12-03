namespace Quic{
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
    export interface IAsync{
        (resolve:(result)=>void,reject?:(err)=>void):void;
    }
    export class Promise{
        __done_handlers__:Array<(result)=>void>;
        __error_handlers__:Array<(error)=>void>;
        constructor(async_func:IAsync){
            
            let resolve :(result:any)=>Promise= (result:any):Promise=>{
                if(result instanceof Promise){
                    (result as Promise).then((result)=>{
                        if(this.__done_handlers__) for(let i=0,j=this.__done_handlers__.length;i<j;i++) this.__done_handlers__.shift().call(this,result);
                        this.then =(done:(result:any)=>void,error?:(result:any)=>void):Promise=>{if(done)done.call(this,result);return this;};
                        this.done = (done:(result:any)=>void)=>{if(done)done.call(this,result);return this;};
                        this.reject = (reject:(err)=>void)=>{return this;};
                    },(err)=>{
                        if(this.__error_handlers__) for(let i=0,j=this.__error_handlers__.length;i<j;i++) this.__error_handlers__.shift().call(this,err);
                        this.then =(done:(result:any)=>void,error?:(result:any)=>void):Promise=>{if(error)error.call(this,err);return this;};
                        this.reject = (reject:(err:any)=>void)=>{if(reject)reject.call(this,err);return this;};
                        this.done = (done:(err)=>void)=>{return this;};
                    });
                    return this;
                }else{
                    this.then =(done:(result:any)=>void,error?:(result:any)=>void):Promise=>{if(done)done.call(this,result);return this;};
                    this.done = (done:(result:any)=>void)=>{if(done)done.call(this,result);return this;};
                    this.reject = (reject:(err)=>void)=>{return this;};
                    return this;
                }
            };
            let reject :(err:any)=>Promise=(err:any):Promise=>{
                if(this.__error_handlers__) for(let i=0,j=this.__error_handlers__.length;i<j;i++) this.__error_handlers__.shift().call(this,err);
                this.then =(done:(result:any)=>void,error?:(result:any)=>void):Promise=>{if(error)error.call(this,err);return this;};
                this.reject = (reject:(err:any)=>void)=>{if(reject)reject.call(this,err);return this;};
                this.done = (done:(err)=>void)=>{return this;};
                return this;
            }
            if(async_func){
                async(()=>{
                    try{
                        async_func.call(this,resolve,reject);
                    }catch(ex){
        
                    }
                });
            } else {
                this.resolve = resolve;
                this.reject = reject;
            }
            
        }
        then(done:(result)=>void,error?:(result)=>void):Promise{
            if(done){
                (this.__done_handlers__ ||(this.__done_handlers__=[])).push(done);
            }
            if(error){
                (this.__error_handlers__ ||(this.__error_handlers__=[])).push(error);
            }            
            return this;
        }
        done(done:(result)=>void):Promise{
            if(done){
                (this.__done_handlers__ ||(this.__done_handlers__=[])).push(done);
            }
            return this;
        }
        error(error:(err)=>void):Promise{
            if(error){
                (this.__error_handlers__ ||(this.__error_handlers__=[])).push(error);
            } 
            return this;
        }
        resolve?:(result:any) => Promise;
        reject?:(err:any)=>Promise;

    }
    function when(...args:Array<IAsync>):Promise{
        return new Promise(function(resolve,reject):void{
            let count = args.length+1;
            let results :Array<any> = [];
            let error_index:number;
            let loop :(async_func:IAsync,index:number)=>boolean = (async_func:IAsync,index:number)=>{
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