
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.promise.ts" />
/// <reference path="../base/quic.transport.ts" />
/// <reference path="quic.schema.ts" />
/// <reference path="quic.expression.ts" />
/// <reference path="quic.value.ts" />
namespace Quic{
    export namespace Models{
        export interface IModel extends IDataValue{
            $model_state:ModelState;
            fetch():IPromise;
        }
        export interface IModelAccess{
            (value?:any,evt?:any):any;
            model?:IModel;
        }
        export interface ModelOpts{
            url?:any;
            transport?:any;
            data:any;
            imports:{[index:string]:any};
            src_model?:IModel;
            schema?:ISchema;
        }
        export class Model extends DataValue implements IModel {
            $model_state:ModelState;
            //transport:TransportOpts;
            constructor(opts:ModelOpts){
                super(opts.schema,null);
                this.$model_state = new ModelState(opts,this);          
            }
            fetch():IPromise{ return this.$model_state.fetch(); }
        }

        export class ModelState{
            opts:ModelOpts;
            model:Model;
            src_model:IModel;
            transport:TransportOpts;
            imports:Array<Function>;
            raw:any;
            data:any;
            __fetchPromise:IPromise;
            constructor(opts:ModelOpts,model:Model){
                this.opts = opts;
                this.model = model;
                if(opts.imports){
                    if(!opts.src_model) throw new Exception("model required",opts);
                    this.src_model = opts.src_model;   
                    this.imports=null;                 
                }
                if(opts.data){
                    this.raw = opts.data;
                    this.fetch = ():IPromise=>{
                        if(this.__fetchPromise) return this.__fetchPromise;
                        return this.__fetchPromise = new Promise((resolve,reject)=>{
                            
                            this._onDataArrived(this.raw,resolve,reject);
                            
                            
                        });
                    };
                }
            }
            fetch():IPromise{
                if(this.__fetchPromise===null){
                    return this.__fetchPromise = new Promise((resolve,reject)=>{
                        let transOpts:TransportOpts = deepClone(this.transport);
                        transOpts.url = (this.model.parse(this.transport.url) as IModel).get_value();
                        //this.notify("onfetching",transOpts);
                        Quic.transport(transOpts).then((result)=>{
                            this._onDataArrived(result,resolve,reject);                            
                        },(err,at)=>{
                            ctx.error("ajax request is failed",transOpts,err,at);
                            reject(err,at);
                        });
                    });
                }else {
                    return this.__fetchPromise;
                }
            }
            _onDataArrived(raw:any,resolve,reject){
                this.raw = raw;
                let result = raw.length!==undefined && raw.push && raw.shift?[]:{};
                for(let i in raw) result[i]=raw[i];
                this.model.set_value(result);
                if(this.imports===null){
                    this.imports=[];
                    for(let n in this.opts.imports){
                        this.imports.push(imports(this.model,this.src_model,n,this.opts.imports[n]));
                    }
                }else if(this.imports){
                    for(let n in this.imports) this.imports[n]();
                }
                this.__fetchPromise=undefined;
                resolve(result);
            }

        }
        
        function imports(destModel:IDataValue,srcModel:IDataValue,key:string,value:any):Function{
            let destValue = destModel.find(key) as IModel;
            if(typeof value==="string" && value.length>3 && value[0]==="$" && value[value.length-1]==="}"){
                let expr :IDataValue;let dbBind=false;
                if(value[1]==="{"){
                    expr = srcModel.parse(value) as IModel;
                    destValue.set_value(expr.get_value());
                }else if(value[1]==="$" && value[2]==="{"){
                    expr = srcModel.parse(value.substr(1)) as IModel;
                    destValue.set_value(expr.get_value());
                    expr.subscribe((value,publisher,evt)=>{
                        destValue.set_value(value);
                    });
                }
                return function(){
                    destValue.set_value(expr.get_value(),false);
                };
            }
            destValue.set_value(deepClone(value));
            return function(){
                destValue.set_value(deepClone(value),false);
            }
        }
    }
}
exports.Model = Quic.Models.Model;