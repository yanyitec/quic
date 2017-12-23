
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="quic.schema.ts" />
/// <reference path="quic.expression.ts" />
/// <reference path="../quic.package.ts" />
namespace Quic{
    export namespace Models{
        export interface IModel extends IDataValue{
            _$opts:ModelOpts;
            _$rawData:any;
            //fetch():IPromise;
            get_access(text:string,mixed?:boolean):IModelAccess;
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
            model?:IModel;
        }
        export class Model extends DataValue{
            _$opts:ModelOpts;
            _$rawData:any;
            __fetchPromise:any;
            //transport:TransportOpts;
            constructor(opts:ModelOpts){
                super(null,null);
                this._$opts= opts;
                this.__accesses = {};
                
                let data={};
                if(opts.imports){
                    if(!opts.model){throw new Error("imports require model");}
                    for(let n in opts.imports){
                        //imports(this,opts.model,data,n,opts.imports[n]);
                    }
                } 
            }
            get_access(text:string,mixed?:boolean):IModelAccess{
                let access:IModelAccess = this.__accesses[text];
                if(!access){ 
                    let innerAccess :IAccess;
                    if(mixed===true){
                        innerAccess = Expression.parse(text).genAccess(this._$schema);
                    }else {
                        innerAccess = new MemberAccessExpression(text).genAccess(this._$schema);
                    }
                    let dataValue :IDataValue =innerAccess(this);
                    access = (value?:any,evt?:any):any=>{
                        if(value===undefined){
                            return dataValue.get_value();
                        }
                        if(value==="quic:undefined") {value===undefined;}
                        dataValue.set_value(value,evt);
                    };
                    this.__accesses[text] = access;
                    access.model= this;
                    let deps:Array<ISchema> = innerAccess.deps;
                    for(let i in deps){
                        
                    }
                }
                return access;
            }
            
            __accesses:{[index:string]:IModelAccess};
        }
        function noticeDiff(rootData:any,data:any,compare:any,schema:ISchema){
            let newCompare:any;
            let enumerator :any;
            if(schema.isArray){
                newCompare =[];
                enumerator=schema.indexs;
            } else if(schema.isObject){
                newCompare= {};
                enumerator = schema.props;
            }else {
                if(compare!==data){
                    //schema.notify(data,rootData,schema);
                    return deepClone(data);
                }
                return compare;
            }
            for(let name in enumerator){
                let subData = data[name];
                let subCompare = compare[name];
                let subSchema = schema.props[name];
                if(subData!==subCompare){
                    //schema.notify(subData,rootData,subSchema);
                    newCompare[name] = deepClone(subData);
                }else if(subSchema.isObject){
                    newCompare[name] = noticeDiff(rootData,subData,subCompare,subSchema);
                }
            }
            return newCompare;
        }
        function imports(destModel:IModel,srcModel:IModel,destData:any,key:string,value:any){
            if(key){
                //let destAccess :IModelAccess = destModel.access(key);
                if(typeof value==="string" && value.length>3){
                    if(value[0]==="$" && value[1]==="{" && value[value.length-1]==="}"){
                        //let srcAccess:IModelAccess = srcModel.access(value,true);
                        //destAccess(destData,srcAccess(srcModel.data));
                        return;
                    }
                }
                //destAccess(destData,deepClone(value));
            }else {
                let t = typeof value;
                if(t==="object"){
                    for(let n in value){
                        for(let n in value){
                            destData[n] = deepClone(value[n]);
                        }
                    }
                    return;
                }
                if(t ==="string" && value.length>3){
                    if(value[0]==="$" && value[1]==="{" && value[value.length-1]==="}"){
                        //let srcAccess:IModelAccess = srcModel.access(value,true);
                        //let srcValue = srcAccess(srcModel.data);
                        //if(typeof srcValue==="object"){
                        //    for(let n in srcValue){
                        //        destData[n] = deepClone(srcValue[n]);
                        //    }
                        //}else {
                        //    destData[""] = srcValue;
                        //}
                        
                        return;
                    }
                }
                destData[""]=value;
            }
        }
        let idSeed:number = 0;
        function idNo(){
            if(++idSeed===2100000000)idSeed=0;
            return idSeed;
        }
    }
}
exports.Model = Quic.Models.Model;