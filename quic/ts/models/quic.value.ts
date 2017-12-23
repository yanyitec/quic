
/// <reference path="quic.schema.ts" />
/// <reference path="../base/quic.observable.ts" />
namespace Quic{
    export namespace Models{
        export interface IDataValue{
            subscribe(listener:IValueChangeListener):IDataValue;
            unsubscibe(listener:IValueChangeListener):IDataValue;
            get_value(fillDefault?:boolean):any;
            set_value(value:any,evtArgs?:any):any;
            notify(evt:ValueChangeEventArgs);
            define(text:string):IDataValue;
            delete(name:string):IDataValue;
            updateSchema():IDataValue;
        }
        export interface ValueChangeEventArgs{
            value:any;
            old_value:any;
            publisher:IDataValue;
            src:ValueChangeEventArgs;
            index?:number;
        }
        export interface IValueChangeListener{
            (value:any,publisher:IDataValue,evtArgs:ValueChangeEventArgs):any;
        }
        export class DataValue implements IDataValue{
            _$superior:IDataValue;
            _$schema:ISchema;
            __listeners?:Array<IValueChangeListener>;
            length?:number;
            constructor(schema:ISchema,superior:IDataValue){
                if(!superior){
                    let mockData = {};
                    superior = {
                        subscribe:function(){return this;},
                        unsubscibe:function(){return this;},
                        notify:function(){return this;},
                        get_value:function(){return mockData;},
                        set_value :function(){throw new Error("invalid operation");},
                        define:function(){throw new Error("invalid operation");},
                        updateSchema:function(){return this;},
                        delete:function(){return this;}
                    };
                }
                this._$superior = superior;
                this._$schema = schema || new Schema();
                if(schema.isObject){
                    let me :any = this;
                    for(let propname in schema.props){
                        me[propname] = new DataValue(schema.props[propname],this);
                    }
                }
            }
            get_data():any{
                let data :any= this._$superior.get_value();
                if(this._$schema.isArray){
                    this.length = data.length;
                }
                return data;
            }
           
            get_value():any{
                let schema = this._$schema;
                let result = this.get_data()[schema.name];
                if(!result && schema.isObject){
                    result = schema.isArray?[]:{};
                    this._$superior.set_value(result,false);
                }
                return result;
            }
            set_value(value:any,srcEvtArgs?:any):any{
                let schema :ISchema = this._$schema;
                let name = schema.name;
                let data: any = this.get_data();
                //整理值。如果schema是object/array，必须是正确的对象
                if(!value){
                    value = schema.isArray?[]:(schema.isObject?{}:value);
                }
                let evtArgs:any;
                //获取原来的值
                let oldValue = data[name];
                
                if(!schema.isObject){
                    //前后比较，没有变更就什么都不做
                    if(oldValue===value)return value;
                    //赋给新的值
                    data[name] = value;
                    //不需要事件，直接返回
                    if(srcEvtArgs===false) return value;
                }else {
                    if(oldValue!==value){
                        //赋给新的值
                        data[name] = value;
                        //触发自己的valuechange事件
                    }
                }                
                
                if(schema.isObject){
                    let me :any = this;
                    for(let prop in me){
                        let member :any= me[prop];
                        if(member && member._$superior===this)member.set_value(value[prop],srcEvtArgs===false?false:evtArgs);
                    }
                }
            }
            subscribe(listener:IValueChangeListener):IDataValue{
                (this.__listeners || (this.__listeners=[])).push(listener);
                return this;
            }
            unsubscibe(listener:IValueChangeListener):IDataValue{
                if(!this.__listeners)return this;
                let existed :IValueChangeListener;
                for(let i=0,j=this.__listeners.length;i<j;i++){
                    if((existed=this.__listeners.shift())!==listener) this.__listeners.push(existed);
                }
                return this;
            }
            notify(evtArgs:ValueChangeEventArgs):IDataValue{
                if(this.__listeners){
                    for(let i = 0,j=this.__listeners.length;i<j;i++){
                        this.__listeners[i](evtArgs.value,this,evtArgs);
                    }
                }
                return this;
            }
            define(text:string):IDataValue{
                let dataValue:any = this;
                this._$schema.define(text,(propname,schema,rootSchema)=>{
                    let prop = dataValue[propname];
                    if(!prop) {
                        dataValue[propname] = new DataValue(schema.itemSchema||schema,this);
                    }
                    dataValue = prop;
                });
                return this;
            }
            delete(name:string|number):IDataValue{
                if(!this._$schema.isObject)return null;
                let existed;
                let me :any = this;
                existed = me[name];
                if(existed){
                    if(this._$schema.isArray){
                        let data = this.get_data();
                        let at = name as number;
                        for(let i =at,j=data.length-1;i<j;i++){
                            data[i] = data[i+1];
                        }
                        data.pop();
                        this.length = data.length;
                    }else{
                        let data = this.get_data();
                        delete data[name];
                        delete me[name];
                    }
                }
                return existed;
            }
            updateSchema():IDataValue{
                let schema = this._$schema;
                if(schema.isObject){
                    let me :any = this;
                    for(let propname in schema.props){
                        let prop = me[propname];
                        if(prop){ prop.updateSchema();}
                        else {me[propname] = new DataValue(schema.props[propname],this);}
                        
                    }
                }
                return this;
            }
            toString(){
                let result = this.get_value();
                if(result===undefined || result===null)return "";
                return result.toString();
            }
        };
    }
}
exports.DataValue= Quic.Models.DataValue;