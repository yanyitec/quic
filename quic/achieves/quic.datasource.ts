
/// <reference path="../base/quic.promise.ts" />
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.transport.ts" />
/// <reference path="quic.schema.ts" />
/// <reference path="quic.expression.ts" />
/// <reference path="../quic.view.ts" />
/// <reference path="../quic.package.ts" />
namespace Quic{
    export interface ISpecializedAccess{
        (value?:any,sender?:any):any;
        defaultSender?:any;
        rawAccess?:IAccess;
    }
    export interface IValueChangeListener{
        (value:any,evtArgs?:any):any;
    }
    export interface IImportItem{
        access:ISpecializedAccess;
        sourceAccess:(noneToEmpty?:string)=>any;
        sourceListener:IValueChangeListener;
    }
    
    export interface DataSourceOpts{
        data?:any;
        url?:any;
        transport?:any;
        imports?:any;
        datasource?:IDataSource;
    }
    export interface IDataSource extends IObservable{
        opts:DataSourceOpts;
        transport?:TransportOpts;
        value?:any;
        dataSource?:IDataSource;
        imports?:{[index:string]:IImportItem};
        package?:IPackage;
        
        incoming:any;
        fetch():IPromise;
        data(value?:any,sender?:any):any;
        expr(text:string):(noneToEmpty?:string)=>any;
        access(text:string,defaultSender?:any):(value?:any,sender?:any)=>any;
        dispose();
    }
    
    export class DataSource extends Observable{
        __exprs:{[index:string]:IExpression};
        __fetchPromise:any;
        __internalData:any;
        __compareData:any;
        incoming:any;
        value:any;
        imports:{[index:string]:IImportItem};
        opts:DataSourceOpts;
        transport:TransportOpts;
        datasource:IDataSource;
        package?:IPackage;

        constructor(opts:DataSourceOpts,rootSchema:ISchema){
            super();
            this.opts = opts;
            this.__accesses={};
            this.__exprs={};
            this.exprFactory = exprFactory || new ExpressionFactory();
            this.initImports(opts);
            if(opts.data){
                this.onDataArrived(opts.data);
                this.fetch = ()=>{
                    return new Promise((resolve)=>{
                        resolve(this.value,this);
                    });
                };
            }else if(this.imports.transport){
                this.__fetchPromise = false;
            }else {
                ctx.throw("Invalid datasource opts","url or data or imports is required",opts);
            }
        }
        protected initImports(opts:DataSourceOpts){
            
            let trans = opts.transport;
            let url = opts.url;
            let imports = opts.imports;
            let datasource = this.datasource = opts.datasource;
            
            if(trans){
                url || (url = opts.url);
                if(url) trans = {url:url,method:"GET",dataType:"json"};
            }
            if(imports){
                if(!datasource) { ctx.throw("Both maps & datasource must be existed"); }
                let settingMaps:{[index:string]:IImportItem} = this.imports = {};
                let loop=(target,src)=>{
                    let targetAccess = this.access(target,this);
                    let srcAccess :IExpression;
                    if(typeof src==="string" && src.length>=3 && src[0]=="$" && src[1]=="{" && src[src.length-1]=="}"){
                        srcAccess = datasource.expr(src);
                    } else {
                        srcAccess = ()=>deepClone(src);
                    }
                    let sourceListener:IValueChangeListener;
                    if(!srcAccess.isAccess){
                        sourceListener = (value,evtArgs)=>{
                            targetAccess(value,{sender:this,datasource : this , access:targetAccess ,src:evtArgs});
                        };
                        datasource.subscribe(src,sourceListener);
                    }
                    
                    settingMaps[src]={access:targetAccess,sourceAccess:srcAccess,sourceListener:sourceListener};
                };
                for(let target in imports){
                    loop(target,imports[target]);
                }
                
            }else if(datasource){ ctx.throw("Both maps & datasource must be existed"); }

        }

        update(data:any){
            let compareData = this.__compareData;
            for(let n in this.__accesses){
                let access = this.__accesses[n];
                let compareValue = access(compareData);
                let currentValue = access(data);
                if(compareValue){
                    let rawFrom = compareValue.quic_extend_from;
                    //if()
                }
            }
        }

        protected onDataArrived(incoming:any,evtArgs?:any):any{
            this.incoming= incoming;
            let isArray = incoming && incoming.push && incoming.pop && incoming.shift && incoming.length!==undefined;
            let outgoing ;
            let imports :{[index:string]:IImportItem} = this.imports;
            if(imports){
                if(!outgoing) {outgoing = this.value = isArray?[]:{};}
                for(let srcname in imports){
                    let item = imports[srcname];
                    let val = item.sourceAccess();
                    item.access(val===undefined?"quic:undefined":val,"quic:no-propagation");
                }
            }
            if(!outgoing){
                outgoing = this.value = incoming;
            }else {
                for(let m in incoming){
                    outgoing[m] = incoming[m];
                }
            }
            for(let p in this.__accesses){
                let access:any = this.__accesses[p];
                let pvalue = access();
                this.notify(p,pvalue,{sender:this,datasource:this,access:access,src:evtArgs});
            }
            this.notify("onvaluechanged",outgoing,evtArgs);
            return outgoing;

        }
        fetch():IPromise{
            if(this.__fetchPromise===false){
                return this.__fetchPromise = new Promise((resolve,reject)=>{
                    let transOpts:TransportOpts = deepClone(this.transport);
                    transOpts.url = this.expr(transOpts.url)();
                    this.notify("onfetching",transOpts);
                    Quic.transport(transOpts).then((result)=>{
                        this.__fetchPromise=false;
                        this.onDataArrived(result);
                        resolve(this.value,this);
                    },(err,at)=>{
                        ctx.error("ajax request is failed",transOpts,err,at);
                        reject(err,at);
                    });
                });
            }else {
                return this.__fetchPromise;
            }
        }

        data(prop?:any,value?:any,evtArgs?:any):any{
            if(prop===undefined){
                if(this.__fetchPromise===false){
                    return new Promise((resolve)=>{
                        resolve(this.incoming);
                    });
                }else return this.fetch();
            }

            
            if(typeof prop==="string"){
                if(prop==="quic:value"){return this.value;}

                let access= this.access(prop);
                if(value===undefined){ return access;}
                access(value,evtArgs);
                return this;
            }
            evtArgs = value;
            value= prop;
            this.onDataArrived(value);
            return this;
        }


        expr(text:string):(noneToEmpty?:string)=>any{
            let specializedExpr : IExpression = this.__exprs[text];
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
                if(this.incoming===undefined) ctx.throw("data is not ready in DataSource");
                return expr(this.value,noneToEmpty);
            };
            (specializedExpr as IExpression).expression = expr.expression;
            (specializedExpr as IExpression).deps = expr.deps;
            (specializedExpr as IExpression).isAccess = expr.isAccess;

            return this.__exprs[text]= specializedExpr;
        }
        access(text:string,defaultSender?:any):(value?:any,sender?:any)=>any{
            let specializedAccess : ISpecializedAccess = this.__accesses[text];
            if(specializedAccess)return specializedAccess;
            let access:IAccess =  this.exprFactory.accessFactory.getOrCreate(text);
            specializedAccess = (value?:any,sender?:any):any=>{
                if(this.incoming===undefined) ctx.throw("data is not ready in DataSource");
                if(value===undefined) return access(this.value);
                access(this.incoming,value);
                this.notify(text,value, {sender:sender||defaultSender,dataSource:this,access:specializedAccess});
            };
            this.subscribe("onvaluechanged",(value,evtArgs)=>{
                let fieldvalue = access(this.value);
                this.notify(text,fieldvalue, {sender:defaultSender,dataSource:this,access:specializedAccess,src :evtArgs});
            });
            specializedAccess.rawAccess = access;
            specializedAccess.defaultSender = defaultSender;
            return this.__accesses[text] = specializedAccess;
        }
        dispose(){
            if(this.imports){
                let imports = this.imports;
                let ds = this.datasource;
                for(let src in imports){
                    let item = imports[src];
                    if(item.sourceListener )ds.unsubscribe(src,item.sourceListener);
                }
            }
        }
    }
}