
/// <reference path="quic.schema.ts" />
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
namespace Quic{
    export namespace Models{
        export interface IDataValue extends IDataDefiner{
            $super;
            $root;
            _$schema;
            subscribe(listener:IValueChangeListener):IDataValue;
            unsubscibe(listener:IValueChangeListener):IDataValue;
            get_value(fillDefault?:boolean):any;
            set_value(value:any,evtArgs?:any):any;
            notify(evt:ValueChangeEventArgs);
            delete(name:string):IDataValue;
            define(name:string):IDataValue;
            find(expr:string,onProperty?:IOnProperty):IDataValue;
            parse(expr:string,onProperty?:IOnProperty):IDataValue;
        }
        export interface ValueChangeEventArgs{
            value:any;
            old_value:any;
            publisher:IDataValue;
            src:ValueChangeEventArgs;
            index?:number;
            cancel?:boolean;
        }
        export interface IValueChangeListener{
            (value:any,publisher:IDataValue,evtArgs:ValueChangeEventArgs):any;
        }
        export class DataValue implements IDataValue{
            $super:IDataValue;
            $root:IDataValue;
            _$schema:ISchema;
            _$data:any;
            __name :string|number;
            __item:IDataValue;
            __listeners?:Array<IValueChangeListener>;
            __computes?:{[index:string]:DataValue};
            length?:number;
            constructor(schema:ISchema,superior:IDataValue,specialname ?:number|string){
                if(!superior){
                    let mockData = {};
                    superior = {
                        $super:undefined,
                        $root:undefined,
                        _$schema:undefined,
                        subscribe:function(){return this;},
                        unsubscibe:function(){return this;},
                        notify:function(){return this;},
                        get_value:function(){return mockData;},
                        set_value :function(){throw new Error("invalid operation");},
                        define:function(){throw new Error("invalid operation");},
                        find:function(){throw new Error("invalid operation");},
                        parse:function(){throw new Error("invalid operation");},
                        delete:function(){return this;}
                    };
                    superior.$root = superior;
                }
                if(this.$super = superior){
                    this.$root = superior.$root;
                }
                if(schema!==null){
                    this._$schema = schema ||(schema= new Schema());
                    if(schema.isObject){
                        let me :any = this;
                        for(let propname in schema.props){
                            me[propname] = new DataValue(schema.props[propname],this);
                        }
                    }
                }
                this.__name = specialname===undefined?schema.name:specialname;
                
            }
            get_data():any{
                if(this._$data===undefined){
                    let data :any= this.$super.get_value();
                    return data;
                }else {
                    return this._$data;
                }
                
            }
           
            get_value():any{
                let schema = this._$schema;
                let result = this.get_data()[this.__name];
                if(!result && schema.isObject){
                    result = schema.isArray?[]:{};
                    this.$super.set_value(result,false);
                }
                if(schema.isArray){
                    this.length = result.length;
                }
                return result;
            }
            set_value(value:any,srcEvtArgs?:any):any{
                let schema :ISchema = this._$schema;
                let name = this.__name;
                let data: any = this.get_data();
                //整理值。如果schema是object/array，必须是正确的对象
                if(!value){
                    value = schema.isArray?[]:(schema.isObject?{}:value);
                }
                let evtArgs:ValueChangeEventArgs;
                //获取原来的值
                let oldValue = data[name];
                
                if(!schema.isObject){
                    //前后比较，没有变更就什么都不做
                    if(oldValue===value)return value;
                    //赋给新的值
                    data[name] = value;
                    //不需要事件，直接返回
                    if(srcEvtArgs===false) return value;
                    //触发自己的valuechange事件
                    evtArgs = {
                        value : value,
                        old_value:oldValue,
                        publisher:this,
                        src:srcEvtArgs
                    };
                    this.notify(evtArgs);
                    return this;
                }
                
                if(oldValue!==value){
                    //赋给新的值
                    data[name] = value;
                    //触发自己的valuechange事件
                    if(srcEvtArgs!==false){
                        evtArgs = {
                            value : value,
                            old_value:oldValue,
                            publisher:this,
                            src:srcEvtArgs
                        };
                        this.notify(evtArgs);
                    }
                }
                if(schema.isArray){
                    this.length=value.length;
                }
                let me :any = this;
                let boardcast = srcEvtArgs!==false && (!evtArgs || !evtArgs.cancel);
                for(let prop in me){
                    let member :any= me[prop];
                    if(member && member.$super===this){
                        (member as any)._$data = value;
                        if(boardcast)member.set_value(value[prop],evtArgs);
                    }
                }
                return this;
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
                    let cancel =false;
                    for(let i = 0,j=this.__listeners.length;i<j;i++){
                        if(this.__listeners[i](evtArgs.value,this,evtArgs)===false) cancel=true;
                    }
                    evtArgs.cancel = cancel;
                }
                return this;
            }
            define(name:string|number):IDataValue{
                let me :any = this;
                let schema :ISchema = this._$schema;
                if(name==='quic:array') {
                    let subschema = schema.define("quic:array") as ISchema;
                    if(!this.__item) this.__item = new DataValue(subschema,this);
                    return this.__item;
                }else {
                    if(schema.isArray){
                        return me[name] = new DataValue(schema.itemSchema,this,name);
                    }else {
                        let schema = this._$schema.define(name.toString()) as ISchema;
                        return me[name] = new DataValue(schema,this);
                    }
                    
                }
            }
            find(text:string,onProp?:IOnProperty):IDataValue{
                let dataValue:any = this;
                this._$schema.find(text,(propname,schema)=>{
                    let prop :DataValue = dataValue[propname];
                    if(!prop) {
                        dataValue[propname] = new DataValue(schema.itemSchema||schema,this);
                    }
                    dataValue = prop;
                    
                });
                return dataValue;
            }
            parse(text:string,onProp?:IOnProperty):IDataValue{
                let deps:Array<IDataValue> = [];
                let dataValue:DataValue=this;
                let me = this;
                let def = this._$schema.parse(text,(propname,schema,reset)=>{
                    let prop :DataValue = this;
                    if(reset){
                        deps.push(dataValue);
                        dataValue = this;
                    }
                    prop = dataValue[propname];
                    if(!prop) {
                        dataValue[propname] = new DataValue(schema.itemSchema||schema,this);
                    }
                    dataValue = prop;
                }) as DefineOpts;
                if(def.schema || (deps.length===1 && deps[0]===dataValue)){
                    return dataValue;
                } else {
                    let dvalue = new DataValue(null,this);
                    (this.__computes ||(this.__computes={}))[text] = dvalue;
                    dvalue.get_value = ()=>{
                        return def.expression.getValue(this.get_data());
                    };
                    dvalue.set_value=()=>this;
                    for(let i in deps){
                        let dep = deps[i];
                        dep.subscribe((value:any,publisher,evt:ValueChangeEventArgs)=>{
                            let myEvt = {
                                old_value:(dvalue as any).__oldvalue,
                                value:(dvalue as any).__oldvalue = dvalue.get_value(),
                                src:evt,
                                publisher:dvalue
                            };
                            dvalue.notify(myEvt);
                        });
                    }
                    return dvalue;
                }

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
            
            toString(){
                let result = this.get_value();
                if(result===undefined || result===null)return "";
                return result.toString();
            }
        };
        let idSeed:number = 0;
        function idNo(){
            if(++idSeed===2100000000)idSeed=0;
            return idSeed;
        }
    }
}
exports.DataValue= Quic.Models.DataValue;