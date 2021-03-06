
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
            fetch():IPromise;
        }
        export interface IModelAccess{
            (value?:any,evt?:any):any;
            model?:IModel;
        }
        export interface ModelOpts{
            url?:any;
            transport?:any;
            data?:any;
            imports?:{[index:string]:any};
            src_model?:IModel;
            schema?:ISchema;
        }
        

        export class Model extends DataValue implements IModel{
            $opts:ModelOpts;
            $src_model:IModel;
            $transport:TransportOpts;
            $imports:Array<Function>;
            $raw:any;
            $rootData:any;
            $data:any;
            __fetchPromise:IPromise;
            constructor(opts:ModelOpts,rootData?:any){
                super(opts.schema,null);
                this.$opts = opts;
                this.$data = this.$rootData = rootData;
                if(opts.imports){
                    if(!opts.src_model) throw new Exception("model required",opts);
                    this.$src_model = opts.src_model;   
                    this.$imports=null;                 
                }
                if(opts.data || !opts.url || !opts.transport){
                    this.$raw = opts.data;
                    if(this.$raw===undefined) this.$raw = {};
                    this.fetch = ():IPromise=>{
                        if(this.__fetchPromise) return this.__fetchPromise;
                        return this.__fetchPromise = new Promise((resolve,reject)=>{
                            
                            this.__onDataArrived(this.$raw,resolve,reject);
                            
                            
                        });
                    };
                }
            }
            fetch():IPromise{
                if(this.__fetchPromise===undefined){
                    return this.__fetchPromise = new Promise((resolve,reject)=>{
                        let transOpts:TransportOpts = deepClone(this.$transport);
                        transOpts.url = (this.parse(this.$transport.url) as IModel).get_value();
                        //this.notify("onfetching",transOpts);
                        Quic.transport(transOpts).then((result)=>{
                            this.__onDataArrived(result,resolve,reject);                            
                        },(err,at)=>{
                            ctx.error("ajax request is failed",transOpts,err,at);
                            reject(err,at);
                        });
                    });
                }else {
                    return this.__fetchPromise;
                }
            }
            __onDataArrived(raw:any,resolve,reject){
                this.$raw = raw;

                let result ;
                let isArr = raw.length!==undefined && raw.push && raw.shift;
                if(this.$rootData){
                    result = this.$rootData;
                    if(isArr){
                        result.length = raw.length;
                    }
                } 
                //= raw.length!==undefined && raw.push && raw.shift?[]:{};
                for(let i in raw) result[i]=raw[i];
                this.set_value(result,false);
                if(this.$imports===null){
                    this.$imports=[];
                    for(let n in this.$opts.imports){
                        this.$imports.push(imports(this,this.$src_model,n,this.$opts.imports[n]));
                    }
                }else if(this.$imports){
                    for(let n in this.$imports) this.$imports[n]();
                }
                this.__fetchPromise=undefined;
                this.notify({
                    value:result,
                    publisher:this,
                    old_value:null,
                    src:null
                });
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