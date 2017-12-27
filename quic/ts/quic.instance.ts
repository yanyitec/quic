
/// <reference path="models/quic.model.ts" />
/// <reference path="models/quic.schema.ts" />
/// <reference path="views/quic.view.ts" />
/// <reference path="packages/quic.package.ts" />
namespace Quic{
    export interface IController{
        $quic?:IQuicInstance;
        $model?:Models.IModel;
        $view?:Views.View;
        initing?:(opts:QuicOpts,quic:IQuicInstance)=>void;
        created?:(model:Models.IModel,view:Views.View,quic:IQuicInstance)=>void;
        binding?:(data:any,reason:string,quic:IQuicInstance)=>void;
    }
    export interface QuicOpts extends Models.ModelOpts {
        element:HTMLElement;
        fields:any;
        includes:any;
        excludes:any;
        model:any;
        viewType:string;
        setting:string;
        controller:IController;
    }
    export interface IQuicInstance extends IObservable,IController{
        _T(key:string):string;
        package:Packages.IPackage;
        opts:QuicOpts;
        model:Models.IModel;
        view:Views.View;
        controller:IController;
        element:HTMLElement;
        fields:{[index:string]:Views.ViewOpts};
    }
    export class QuicInstance extends Promise implements IQuicInstance{
        package:Packages.IPackage;
        opts:QuicOpts;
        model:Models.IModel;
        view:Views.View;
        controller:IController;
        element:HTMLElement;
        fields:{[index:string]:Views.ViewOpts};
        subscribe:(name:string,lisenter:Function)=>any;
        unsubscribe:(name:string,lisenter:Function)=>any;
        notify:(name:string,evt?:any,applyInvo?:any,other?:any)=>any;

        constructor(opts:QuicOpts,pack:Packages.IPackage){
            super((resolve,reject)=>initialize(this,opts,pack,resolve,reject));
        }
        
        
        _T(key:string):string{return key;}
    }
    
    let quicType :any = Quic;
    for(let n in QuicInstance.prototype){
        quicType.prototype[n] = QuicInstance.prototype[n];
    }
    for(let n in Observable.prototype){
        quicType.prototype[n] = Observable.prototype[n];
    }

    function initialize(instance:QuicInstance,opts:QuicOpts,pack:Packages.IPackage,resolve,reject){
        instance.opts = opts;
        instance.element = opts.element;
        instance.package = pack || new Packages.Package(opts);
        instance.package.done((pack)=>packageDone(instance,opts,resolve,reject));        
    }
    function packageDone(instance:QuicInstance,opts:QuicOpts,resolve,reject){
        instance.fields = instance.package.field_config(opts.setting,opts.includes || opts.fields);
        if(opts.controller){
            if(typeof opts.controller ==="function"){
                instance.controller = new (<any>opts.controller)(opts,instance); 
                instance.controller.$quic = this;
                if((<IController>instance).initing) (<IController>instance).initing(opts,instance);
                instance.notify("initing",opts,instance);
            } 
            else {
                instance.controller = opts.controller ||{};
                instance.controller.$quic = this;
                notify(instance,"initing",opts,instance);
            }
        }else {
            instance.controller = {};
        }
        let controller :IController = instance.controller;

        instance.controller.$model = instance.model = initModel(opts,controller);
        let viewType :any= Views.viewTypes[opts.viewType||"form"];
        if(!viewType) throw new Exception("Invalid view type",opts.viewType,opts);
        instance.controller.$view = instance.view = new viewType(instance,null,instance.model,instance);
        notify(instance,"created",instance.model,instance.view,instance);
        instance.model.fetch().done((data)=>modelDone(data,instance,resolve,reject));
    }
    function modelDone(data:any,instance:QuicInstance,resolve,reject){
        notify(instance,"binding",data,instance);
        instance.model.set_value(data);
        if(instance.element){
            let viewElement = instance.view.render();
            notify(instance,"rendering",viewElement,instance);
            if(instance.element){
                instance.element.innerHTML="";
                instance.element.appendChild(viewElement);
                notify(instance,"renderred",viewElement,instance);
            }
        }
    }
    function notify(instance:IQuicInstance,name:string,arg0?:any,arg1?:any,arg2?:any){
        if((<any>instance)[name]) (<any>instance)[name].call(instance,arg0,arg1,arg2);
        instance.notify(name,arg0,arg1,arg2);
        if((<any>instance.controller)[name])(<any>instance.controller)[name].call(instance,arg0,arg1,arg2);
    }
    function initModel(modelOpts:Models.ModelOpts,modelData:any){
        let model = new Models.Model(modelOpts||{});
        for(let n in modelData){
            let member = modelData[n];
            configModel(model,n,member);
        }
        return model;
    }
    
    

    function configModel(model:Models.IDataValue,name:string,value:any){
        if(!/^[a-zA-Z]/g.test(name)) return;
        if(!value) {
            return;
        }
        let t = typeof value;
        if(t==="function")return;
        let subModel:Models.IDataValue = model.define(name);

        
        if(value.length!==undefined && value.pop && value.push){
            subModel.define("quid:array");
            if(value.length>0){
                for(let i in value){
                    configModel(model,i,value[i]);
                }
            }
        }else if(t==="object"){
            for(let n in value) {
                configModel(subModel,n,value[n]);
            }
        }
    }
}
exports.Quic = Quic.QuicInstance;


