/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />

namespace Quic{
    export class ViewCSS implements IViewCSS{
        constructor(viewOpts:ViewOpts){
            this.raw = viewOpts.css;
            //this.base = base;
        }
        raw:string;
        base:string;
        
        
        css(permission?:string):string{
           let _this:any = this;
           let fn = _this[permission];
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
        name:string;
        viewType:string;
        text?:string;
        group?:string;
        permission?:string;
        mappath?:string;
        css?:string;
        Css?:ViewCss;
        viewRenderer:IViewRenderer;
        container?:IViewset;
        validatable?:IValidatable;
        field:Field;
        opts:ViewOpts;
        mappedValue:(data:{[index:string]:any},value?:any)=>any;
        protected _element;
        constructor(container:IViewset,field:Field,opts:ViewOpts){
            this.container = container;
            this.field = field;
            this.opts = opts;
            this.name = opts.name || field.name;
            //viewType && viewBuilder
            this.viewType=opts.viewType;
            if(this.viewType===field.viewType) this.viewRenderer = field.viewRenderer;
            if(!this.viewRenderer) this.viewRenderer = this.field.findViewRenderer(this.viewType);
            if(!this.viewRenderer) return env.throw("Invalid viewType",this.viewType);
            // css
            if(!opts.css || opts.css === field.css){
                this.css = opts.css;
                this.Css = field.Css;
            }else {
                this.Css = new ViewCSS(this.css = opts.css);
            }
            //permission
            this.permission = opts.permission || field.permission || container.permission;
            if(this.permission==="novalidate"){
                this.permission = "editable";
            }else {
                this.validatable = field;
            }
            let mappath:string =opts.mappath?opts.mappath.replace(trimRegx,""):undefined;
            if(mappath!==field.mappath){
                this.mappath = mappath;
                this.mappedValue = mappedValue;
            }else{
                this.mappath = field.mappath;
                this.mappedValue = field.mappedValue;
            } 
        }
        
        value(value?:any):any{
            if(value===undefined) return this.viewRenderer.getValue(this);
            this.viewRenderer.setValue(this,value);
            return this;
        }
        
        
        getAccessor(mappath:string):(data:{[index:string]:any},value?:any)=>any{
            return this.field.getAccessor(mappath);
        }
        
        element():HTMLElement{
            if(this._element) return this._element;
            
            let creator : IRednerView = (this.viewRenderer as any)[this.permission];
            if(!creator) throw new Error("Invalid permission value:" + this.permission);
            creator(this)
        }

        validate():any{
            if(this.validatable){
                return this.validatable.validate(this.value(),this);
            }
        }
        
    }

    

    
    
    
    export let viewRenderers: {[viewType:string]:IViewRenderer} ={};
    
}