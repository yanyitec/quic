
namespace Quic{
    export class ViewCSS implements IViewCSS{
        constructor(viewOpts:ViewOpts){
            this.raw = viewOpts.css;
            this.base = viewOpts.viewType +" " +((viewOpts as FieldViewOpts).icon?(viewOpts as FieldViewOpts).icon + " ":"")+ viewOpts.name;
            
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

    

    export class View implements IFieldView{
        name:string;
        viewType:string;
        text?:string;
        group?:string;
        permission?:string;
        position?:string;
        nolabel?:boolean;
        mappath?:string;
        css?:string;
        CSS?:ViewCSS;
        renderer:IRenderer;
        //module:IModule;
        field?:IField;
        opts:ViewOpts;
        composition:ICompositeView;

        mappedValue:(data:{[index:string]:any},value?:any)=>any;
        protected _element;
        constructor(quic:IQuic,composition:ICompositeView,field:IField,opts_:ViewOpts){
            let opts:FieldViewOpts  = opts_ as FieldViewOpts;
            this.opts = opts;
            this.name = opts.name?opts.name.replace(trimRegx,""):undefined;
            if(!this.name && field) this.name = field.name;
            if(!this.name) ctx.throw("name is required","view.constructor",opts);
            this.composition = composition;
            //viewType && viewBuilder
            this.viewType=opts.viewType?opts.viewType.replace(trimRegx,""):undefined;
            if(field){
                if(!this.viewType) this.viewType = field.viewType;
                if(this.viewType===field.viewType) this.renderer = field.renderer;
            }
            if(!this.renderer) this.renderer = quic.findRenderer(this.viewType);
            if(!this.renderer) return ctx.throw("Invalid viewType",this.viewType);
            
            // css
            this.css=opts.css?opts.css.replace(trimRegx,""):undefined;
            if(field&&(!this.css || this.css === field.css)) this.CSS = field.CSS;
            else this.CSS = new ViewCSS(this);
            //permission
            this.permission = opts.permission || (field &&field.permission) || (composition && composition.permission) || "validatable";
            
            this.position = opts.position || (field &&field.position) || (composition && composition.position) ;
            this.nolabel = opts.nolabel || (field &&field.nolabel);
            
            // mappath
           this.mappath =opts.mappath?opts.mappath.replace(trimRegx,""):undefined;
           if(field && (!this.mappath|| this.mappath === field.mappath)) this.mappedValue = field.mappedValue;           
           else this.mappedValue = quic.accessFactory.cached(this.mappath);
            
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