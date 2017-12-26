
/// <reference path="models/quic.model.ts" />
/// <reference path="models/quic.schema.ts" />
/// <reference path="views/quic.view.ts" />
/// <reference path="packages/quic.package.ts" />
namespace Quic{
    export interface IController{
        $quic?:IQuicInstance;
        $model?:Models.IModel;
        $view?:Views.View;
        initing?:(opts:QuicOpts,quic:QuicInstance)=>void;
        created?:(model:Models.IModel,view:Views.View,quic:IQuicInstance)=>void;
    }
    export interface QuicOpts extends IController{
        fields:any;
        includes:any;
        excludes:any;
        modelOpts:any;
        viewType:string;
        setting:string;
        controller:IController;
    }
    export interface IQuicInstance{
        _T(key:string):string;
        package:Packages.IPackage;
        opts:QuicOpts;
        model:Models.IModel;
        view:Views.View;
        controller:IController;
        element:HTMLElement;
        fields:{[index:string]:Views.ViewOpts};
    }
    class QuicInstance implements IQuicInstance{
        package:Packages.IPackage;
        opts:QuicOpts;
        model:Models.IModel;
        view:Views.View;
        controller:IController;
        element:HTMLElement;
        fields:{[index:string]:Views.ViewOpts};

        constructor(opts:QuicOpts,pack:Packages.IPackage){
           this.initialize(opts,pack);
        }
        initialize(opts:QuicOpts,pack:Packages.IPackage){
            this.opts = opts;
            this.package = pack || new Packages.Package(null);
            this.fields = getIncludes(opts.setting||"detail",this.package,opts.includes,opts.fields);
            
            if(opts.initing) opts.initing(opts, this);
            this.controller = opts.controller||{};
            this.controller.$quic = this;
            this.controller.$model = this.model = initModel(opts.modelOpts,opts);
            let viewType :any= Views.viewTypes[opts.viewType||"form"];
            if(!viewType) throw new Exception("Invalid view type",opts.viewType,opts);
            this.controller.$view = this.view = new viewType({},null,this.model,this);
            if(opts.created) opts.created(this.model,this.view,this);
        }
        render(decoration?:boolean){
            let element = this.
        }
        _T(key:string):string{return key;}
        
    }

    function getIncludes(setting:string,pack:Packages.IPackage,includes:any,fields:{[index:string]:Views.ViewOpts}){
        return pack.field_config(setting,includes|| fields);
    }
    function initModel(modelOpts:Models.ModelOpts,modelData:any){
        let model = new Models.Model(modelOpts);
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

