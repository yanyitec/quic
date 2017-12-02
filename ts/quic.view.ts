/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />

namespace Quic{
    export interface ViewOpts{
       
        name?:string;
        viewType?:string;
        css?:string;
        text?:string;
        group?:string;
        permission?:string;
        
        mappath?:string;
    }

    

    
    export interface ViewCss{
        visible():string;
        hidden():string;
        readonly():string;
        editable():string;
        toString():string;
    }


    export interface IView extends ViewOpts{
        field?:IField;
        viewBuilder:IViewBuilder;
        Css?:ViewCss;
        container?:IViewset;
        mappedValue:(data:{[index:string]:any},value?:any)=>any;
        value(value?:any):any;
        element():HTMLElement;  
        validatable?:IValidatable;
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
        viewBuilder:IViewBuilder;
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
            if(this.viewType===field.viewType) this.viewBuilder = field.viewBuilder;
            if(!this.viewBuilder) this.viewBuilder = this.field.findViewBuilder(this.viewType);
            if(!this.viewBuilder) return env.throw("Invalid viewType",this.viewType);
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
            if(value===undefined) return this.viewBuilder.getValue(this);
            this.viewBuilder.setValue(this,value);
            return this;
        }
        
        
        getAccessor(mappath:string):(data:{[index:string]:any},value?:any)=>any{
            return this.field.getAccessor(mappath);
        }
        
        element():HTMLElement{
            if(this._element) return this._element;
            
            let creator : ICreateView = (this.viewBuilder as any)[this.permission];
            if(!creator) throw new Error("Invalid permission value:" + this.permission);
            creator(this)
        }

        validate():any{
            if(this.validatable){
                return this.validatable.validate(this.value(),this);
            }
        }
        
    }

    

    export class ViewCSS implements ViewCss{
        constructor(base:string){this.base = base;}
        base:string;
        css(permission?:string):string{
           let _this:any = this;
           let fn = _this[permission];
           if(fn) return fn.call(this);
           return this.base;
        };
        visible:()=>string=():string=>{
            let css = this.base + " field-visible";
            this.visible =():string=>css;
            return css;
        };
        hidden:()=>string=():string=>{
            let css = this.base + " field-hidden";
            this.hidden =():string=>css;
            return css;
        };
        readonly:()=>string=():string=>{
            let css = this.base + " field-readonly";
            this.readonly =():string=>css;
            return css;
        };
        editable:()=>string=():string=>{
            let css = this.base + " field-editable";
            this.editable =():string=>css;
            return css;
        };
        toString:()=>string=():string=>this.base;

    }
    export interface ICreateView{
        (view:IView):HTMLElement;
    }
    

    export interface IViewBuilder{
        //只是可见，没有input元素跟着
        visible:ICreateView;
        //隐藏，但是有input元素
        hidden:ICreateView;
        //只读，不能修改，但是有input元素
        readonly:ICreateView;
        // 可编辑
        editable:ICreateView;
        // 设置View的值，并让view反映该值。
        setValue(view:IView,value:any):any;
        // 获取到该view上的值。
        getValue(view:IView):any;
    }
    
    export let viewBuilders: {[viewType:string]:IViewBuilder} ={};
    
}