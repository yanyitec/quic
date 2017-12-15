
/// <reference path="quic.abstracts.ts" />
/// <reference path="base/quic.context.ts" />
/// <reference path="base/quic.access.ts" />
/// <reference path="base/quic.utils.ts" />
/// <reference path="quic.field.ts" />
namespace Quic{
    export class ViewCSS implements IViewCSS{
        constructor(viewOpts:ViewOpts){
            this.raw = viewOpts.css;
            this.base = viewOpts.viewType +" "+ viewOpts.name;
            
        }
        raw:string;
        base:string;
        
        
        css(permission?:string):string{
           let _me:any = this;
           let fn = _me[permission];
           return fn?fn.call(this):this.general();
        };
        general():string{
            let css = this.raw?this.base + " " + this.raw:this.base ;
            this.general =():string=>css;
            return css;
        }
        visible:()=>string=():string=>{
            let css = this.base + " field-visible";
            if(this.raw) css += " " + this.raw;
            this.visible =():string=>css;
            return css;
        };
        hidden:()=>string=():string=>{
            let css = this.base + " field-hidden";
            if(this.raw) css += " " + this.raw;
            this.hidden =():string=>css;
            return css;
        };
        readonly:()=>string=():string=>{
            let css = this.base + " field-readonly";
            if(this.raw) css += " " + this.raw;
            this.readonly =():string=>css;
            return css;
        };
        editable:()=>string=():string=>{
            let css = this.base + " field-editable";
            if(this.raw) css += " " + this.raw;
            this.editable =():string=>css;
            return css;
        };
        validatable:()=>string=():string=>{
            let css = this.base + " field-validatable";
            if(this.raw) css += " " + this.raw;
            this.editable =():string=>css;
            return css;
        };
        toString:()=>string=():string=>this.base;

    }

    export class View implements IView{

        __viewState:IViewState;
        constructor(opts:ViewOpts,container:IViewState,field:IField){
            this.__viewState = new ViewState(this,opts,container,field);
        }
        get_viewState(name?:string){
            let me:any = this;
            if(name){
                let view:IView = me[name] as IView;
                return view?view.get_viewState():null;
            }else return this.__viewState;
        }
        get_view(name?:string){
            let me:any = this;
            if(name){
                return me[name] as IView;
            }else return this;
        }
        static isAction(viewType){
            return viewType==="action" || viewType==="submit" || viewType==="reset" || viewType==="close" || viewType==="open" || viewType==="navigate";
        }
    }

    export class ViewState implements IViewState{
        name:string;
        viewType:string;
        text?:string;
        group?:string;
        permission?:string;
        position?:string;
        nowrap?:boolean;
        mappath?:string;
        css?:string;
        CSS?:ViewCSS;
        renderer:IRenderer;
        //module:IModule;
        field?:IField;
        opts:ViewOpts;
        composition:IViewState;
        accessor:IDataAccess;
        quic?:IQuic;
        view:IView;

        protected _element;
        constructor(view:IView,opts:ViewOpts,composition:IViewState,field:IField){
            this.opts = opts;
            this.view = view;
            this.composition = composition;
            if(composition) this.quic = composition.quic;
            
            this.name = opts.name?opts.name:undefined;
            if(!this.name && field) this.name = field.name;
            if(!this.name) ctx.throw("name is required","view.constructor",opts);
            
            //viewType && viewBuilder
            this.viewType=opts.viewType?opts.viewType:undefined;
            if(field){
                if(!this.quic)this.quic = field.quic;
                else if(field.quic && field.quic != this.quic){
                    ctx.throw("Quic is not match.","the field's quic is different from the composition's");
                }
                if(!this.viewType) this.viewType = field.viewType;
                if(this.viewType===field.viewType) this.renderer = field.renderer;
            }
            if(!this.renderer ) this.renderer = (this.quic? this.quic.findRenderer(this.viewType):undefined) || renderers[this.viewType];
            if(!this.renderer) return ctx.throw("Invalid viewType",this.viewType);
            
            // css
            this.css=opts.css?opts.css:undefined;
            if(field&&(!this.css || this.css === field.css)) this.CSS = field.CSS;
            else this.CSS = new ViewCSS(this);
            //permission
            this.permission = opts.permission || (field &&field.permission) || (composition && composition.permission) || "validatable";
            
            this.position = opts.position || (field &&field.position) || (composition && composition.position) ;
            this.nowrap = opts.nowrap || (field &&field.nowrap);
            
            // mappath
            this.mappath =opts.mappath?opts.mappath:undefined;
           
           if(field && (!this.mappath|| this.mappath === field.mappath)) {
               this.accessor = field.accessor;   
               this.mappath = field.mappath;    
           }
           if(this.mappath){
                if(this.mappath==="$" || this.mappath ==="$root"){
                    this.accessor = AccessFactory.rootAccess;
                }else if(field && field.mappath === this.mappath) {
                    this.accessor = field.accessor;
                    this.mappath = field.mappath;
                }
            }else {
                if(View.isAction(this.viewType)){
                    this.accessor = AccessFactory.rootAccess;
                }else this.mappath = this.name;
            }
            if(!this.accessor) {
                if (this.quic){
                    this.accessor = this.quic.accessFactory.getOrCreate(this.mappath);
                }else {
                    this.accessor = AccessFactory.getOrCreate(this.mappath);
                }
            }
            
        }
        get_view(name:string):IView{
            return this.view.get_view(name);
        }
        get_viewState(name:string):IViewState{
            if(!name)return this;
            this.view.get_viewState(name);
        }

        
        

        render():HTMLElement{
            return null;
        }
        
        viewValue(value?:any):any{
            if(value===undefined) return this.renderer.getValue(this);
            this.renderer.setValue(this,value);
            return this;
        }
        

        
        
        
        element():HTMLElement{
            if(this._element) return this._element;
            
            let creator : IRender = (this.renderer as any)[this.permission];
            if(!creator) throw new Error("Invalid permission value:" + this.permission);
            creator(this)
        }

        
        
    }
    
    
    
}