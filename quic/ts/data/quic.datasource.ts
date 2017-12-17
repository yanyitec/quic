
/// <reference path="../base/quic.promise.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.transport.ts" />
/// <reference path="quic.access.ts" />
/// <reference path="quic.expression.ts" />
namespace Quic{
    export interface ISpecializedAccess{
        (value?:any,sender?:any):any;
        defaultSender?:any;
        rawAccess?:IAccess;
    }
    export interface DataSourceOpts{
        data?:any;
        transport?:any;
    }
    export interface IDataSource extends IPromise{
        opts:DataSourceOpts;
        transport:(opts:TransportOpts)=>IPromise;
        exprFactory:ExpressionFactory;
        rawData:any;
        fetch():Promise;
        data(value?:any,sender?:any):Promise;
        expr(text:string):(noneToEmpty?:string)=>any;
        access(text:string,defaultSender?:any):(value?:any,sender?:any)=>any;
        dispose();
    }
    
    export class DataSource extends Observable{
        __accesses:{[index:string]:ISpecializedAccess};
        __exprs:{[index:string]:(noneToEmpty?:string)=>any};
        rawData:any;
        __fetchPromise:any;
        __transport:any;
        opts:DataSourceOpts;
        transport:(opts:TransportOpts)=>IPromise;
        exprFactory:ExpressionFactory;

        constructor(opts,exprFactory?:ExpressionFactory,transport?:(opts:TransportOpts)=>IPromise){
            super();
            this.opts = opts;
            this.__accesses={};
            this.__exprs={};
            this.exprFactory = exprFactory || new ExpressionFactory();
            if(opts.data){
                this.rawData = opts.data;
                this.fetch = ()=>{
                    return new Promise((resolve)=>{
                        let data = this.rawData;
                        this.notify("onfetched",data);
                        resolve(data,this);
                    });
                }
            }else if(opts.transport){
                this.__fetchPromise = false;
                this.transport = transport || Quic.transport;
            }else {
                ctx.throw("Invalid datasource opts","transport or data is required",opts);
            }
        }
        fetch():Promise{
            if(this.__fetchPromise===false){
                return this.__fetchPromise = new Promise((resolve,reject)=>{
                    let transOpts:TransportOpts;
                    if(typeof this.opts.transport==="string"){
                        transOpts = {
                            url:this.opts.transport as string,
                            method:"GET",
                            dataType:"json"
                        };
                    }
                    this.notify("onfetching",transOpts);
                    
                    this.transport(transOpts).then((result)=>{
                        let data = this.rawData = result;
                        this.notify("onfetched",data,data);
                        this.__fetchPromise=false;
                        resolve(data,this);
                    },(err,at)=>{
                        ctx.error("ajax request is failed",this.__transport,err,at);
                        reject(err,at);
                    });
                });
            }else {
                return this.__fetchPromise;
            }
        }

        data(value?:any,sender?:any):Promise{
            if(value===undefined){
                if(this.__fetchPromise===false){
                    return new Promise((resolve)=>{
                        resolve(this.rawData);
                    });
                }else return this.fetch();
            }
            this.rawData = value;
            this.notify("onvaluechanged",value,{sender:sender,datasource:this});
        }


        expr(text:string):(noneToEmpty?:string)=>any{
            let specializedExpr : (noneToEmpty?:string)=>any= this.__exprs[text];
            if(specializedExpr)return specializedExpr;
            let expr:IExpression =  this.exprFactory.getOrCreate(text);
            let deps = expr.deps;
            for(let i =0,j=deps.length;i<j;i++){
                let dep = deps[i];
                if(dep!==expr){
                    let depname = dep.mappath;
                    this.subscribe(depname,(value,sender)=>this.notify(text,value,sender));
                }
            }
            specializedExpr =(noneToEmpty?:string):any=>{
                if(this.rawData===undefined) ctx.throw("data is not ready in DataSource");
                return expr(this.rawData,noneToEmpty);
            };
            return this.__exprs[text]= specializedExpr;
        }
        access(text:string,defaultSender?:any):(value?:any,sender?:any)=>any{
            let specializedAccess : ISpecializedAccess = this.__accesses[text];
            if(specializedAccess)return specializedAccess;
            let access:IAccess =  this.exprFactory.accessFactory.getOrCreate(text);
            specializedAccess = (value?:any,sender?:any):any=>{
                if(this.rawData===undefined) ctx.throw("data is not ready in DataSource");
                if(value===undefined) return access(this.rawData);
                access(this.rawData,value);
                this.notify(text,value, {sender:sender||defaultSender,dataSource:this,access:specializedAccess});
            };
            this.subscribe("onvaluechanged",(value,sender)=>{
                let fieldvalue = access(this.rawData);
                this.notify(text,fieldvalue, {sender:sender.sender||defaultSender,dataSource:this,access:specializedAccess});
            });
            specializedAccess.rawAccess = access;
            specializedAccess.defaultSender = defaultSender;
            return this.__accesses[text] = specializedAccess;
        }
        dispose(){

        }
    }
}