
/// <reference path="quic.promise.ts" />
/// <reference path="quic.context.ts" />
/// <reference path="quic.ajax.ts" />
/// <reference path="quic.access.ts" />
namespace Quic{
    export interface Pagable{
        server_paging:boolean;
        page_index:number;
        page_size:number;
    }
    export interface RemoteDataSchema{
        rows:string|Function;
        total:string|Function;
    }
    export interface DataSourceOpts{
        data?:any;
        transport?:any;
        schema:RemoteDataSchema;
        pagable:Pagable;
    }
    export function clone(value):any{
        if(!value) return value;
        if(typeof value==='object'){
            let newValue = value.length!==undefined && value.shift && value.push?[]:{};
            for(let n in value){
                newValue = clone(value[n]);
            }
            return newValue;
        }
        return value;
    }
    export class DataResource extends Observable{
        __data:any;
        __isFetching:any;
        __transport:any;
        opts:DataSourceOpts;
        _schema_rows:Function;
        _schema_total:Function;
        ajax:(opts:any)=>IPromise;

        constructor(opts,accessFactory?:AccessFactory,_ajax?:(opts:any)=>IPromise){
            super();
            this.opts = opts;
            if(opts.data){
                this.__data = opts.data;
                this.fetch = ()=>{
                    return new Promise((resolve)=>{
                        let data = this.__data;
                        this.notify("onfetched",data);
                        resolve(data,this);
                    });
                }
            }else if(opts.transport){
                this.__isFetching = false;
                this.ajax = _ajax || ajax;
            }else {
                ctx.throw("Invalid datasource opts","transport or data is required",opts);
            }
        }
        fetch():Promise{
            if(this.__isFetching===false){
                return this.__isFetching = new Promise((resolve)=>{
                    let trans:any = clone(this.opts.transport) || {};
                    let transData = trans.data || {};
                    this.notify("onfetching",[transData,trans,this],true);
                    trans.data = transData;
                    this.ajax(this.__transport).then((result)=>{
                        let data = this.__data = this._schema_rows(result,this);
                        this.notify("onfetched",data);
                        this.__isFetching=false;
                        resolve(data,this);
                    },(err,at)=>{
                        ctx.error("ajax request is failed",this.__transport,err,at);
                    });
                });
            }
            return this.__isFetching;
            
        }

        data(value?:any):Promise{
            if(this.__isFetching===false){
                return new Promise((resolve)=>{
                    resolve(this.__data);
                });
            }else return this.fetch();
        }

        
    }
}