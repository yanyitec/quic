/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../models/quic.model.ts" />
/// <reference path="../quic.instance.ts" />
namespace Quic{
    export namespace Views{
        export interface ViewOpts{
            perm?:string;
            datapath?:string;
            text?:string;
            template?:(data:any,permissionType:string)=>HTMLElement|string;
            css?:string;
            dataType?:string;
            viewType?:string;
            name?:string;
            desciption?:string;
            decoration?:boolean;
            slot?:string;
            validations?:{[index:string]:any};
            events?:{[index:string]:Function};
        }
        export let viewOptsKeymembers ={
            perm:true,
            datapath:true,
            text:true,
            template:true,
            css:true,
            dataType:true,
            viewType:true,
            desciption:true,
            decoration:true,
            position:true,
            validations:true,
            events:true
        };
        export interface ILocalizable{
            
        }

        
            
        export class View extends Observable{
            $name:string;
            $dataType:string;
            $viewType:string;
            $validations:{[index:string]:string};
            $text:string;
            $description:string;
            $decoration:boolean;
            $idprefix:string;
            $css:string;
            $width?:number;
            $element:HTMLElement;
            $composite:View;
            $opts:ViewOpts;
            
            $model:Models.IModel;
            $quic:IQuicInstance;
            protected __permission:string;
            protected __originPermission:string;
            protected __validatable?:boolean;
            protected __disabled?:Array<Node>;
    
            constructor(opts:ViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super();
                if(!opts) return;
                this.init(opts,composite, model, quic);
            }
            
            get_viewid():string{
                let id = this.$idprefix + GNo(this.$idprefix);
                this.get_viewid =()=>id;
                return id;
            }
            get_value(){
                return this.$model.get_value();
            }

            set_value(value?:any):any{
                this.$model.set_value(value);
                return this;
            }

            validate(state?:any){
                if(!this.__validatable || !this.$validations)return true;
                let value = this.get_value();
                let result:boolean;
                let element = this.$element;
                let tipElement = (element.lastChild || element) as HTMLElement;
                for(let n in this.$validations){
                    let validator = validators[n];
                    if(!validator){
                        ctx.warn("unregistered validation",n);
                        continue;
                    }
                    let validation = this.$validations[n];
                    result = validator(value,validation,this);
                    if(element){
                        if(result===false){
                            ctx.removeClass(element,"quic-validation-success");
                            ctx.removeClass(element,"quic-validation-validating");
                            ctx.addClass(element,"quic-validation-error");
                            let tip = tipElement.title = str_replace(this._T("-valid-" + n),validation);
                            if(state) state[this.$name] = {
                                message:tip,
                                name:this.$name,
                                id:this.get_viewid(),
                                text:this.$text
                            };
                        }else if(result===null){
                            ctx.removeClass(element,"quic-validation-success");
                            ctx.addClass(element,"quic-validation-validating");
                            ctx.removeClass(element,"quic-validation-error");
                            tipElement.title = "";
                        }else{
                            ctx.addClass(element,"quic-validation-error");
                            ctx.removeClass(element,"quic-validation-validating");
                            ctx.removeClass(element,"quic-validation-success");
                            tipElement.title = "";
                        }
                    }
                    
                }
                return result;
            }
    
            is_disabled(value?:boolean){
                if(value===undefined){return this.__disabled!==undefined;} 
                if(value===false){
                    if(this.__disabled){
                        this.$element.style.display="";
                        for(let i =0,j= this.__disabled.length;i<j;i++){
                            this.$element.appendChild(this.__disabled[i]);
                        }
                        this.__disabled=undefined;
                    }
                    return this;
                }else {
                    if(this.__disabled) return this;
                    this.$element.style.display="none";
                    this.__disabled =[];
                    for(let i =0 ,j=this.$element.childNodes.length;i<j;i++){
                        this.__disabled.push(this.$element.firstChild);
                        this.$element.removeChild(this.$element.firstChild);
                    }
                    return this;
                }
            }
            get_permission(){
                if(this.__permission===undefined){
                    if(this.$composite) this.__permission = this.__originPermission = (this.$composite.get_permission() || "validatable") as string;
                    else this.__permission = this.__originPermission ="validatable";
                }
                return this.__permission;
            }
    
            set_permission(value?:string):any{                
                if(this.__permission!==value){
                    let oldPerm = this.__permission;
                    
                    if(this.$element){
                        if(value==="quic:reset"){
                            return this.set_permission(this.__originPermission);
                        }
                        this.__permission = value;
                        
                        let element:HTMLElement = (<any>this.$element);
                        if(value==="disabled"){
                            return this.is_disabled(true);
                        }else {
                            this.is_disabled(false);
                        }
                        let wrapper = (<any>this.$element).quic_wrapFor.parentNode;
                        
                        if(value==="visible"){
                            this.setPermissionCss("visible");
                            wrapper.innerHTML = "";
                            let inputElement = this.render_visibleonly();
                            wrapper.appendChild(inputElement);  
                            this.__validatable=false;
                            return this;                   
                        }
                        if(oldPerm==="visible" || oldPerm==="disabled"){
                            let inputElement = this.render_writable();
                            wrapper.appendChild(inputElement);  
                        }
                        if(value==="hidden"){
                            this.setPermissionCss("hidden");
                            this.__validatable=false;
                        }else if(value==="readonly"){
                            this.setPermissionCss("readonly");
                            this.is_readonly(true);
                            this.__validatable=false;
                            element.style.display="";
                        }else if(value==="writable"){
                            this.setPermissionCss("writable");
                            this.is_readonly(false);
                            this.__validatable = false;
                            
                        }else if(value==="validatable"){
                            this.setPermissionCss("validatable");
                            this.__validatable = true;
                        }
                    }else {
                        this.__permission = value==="quic:reset"?this.__originPermission:value;
                    }
                }
                return this;
                
            }
            
            is_readonly(value?:boolean):any{
                let perm = this.get_permission();
                if(value===undefined){
                    return perm==="visible" || perm==="readonly";
                }
                
                if(perm==="disabled" || perm==="visible" || perm ==="readonly") return this;
                if(this.$element){
                    if(value===true){
                        (<HTMLInputElement>(<any>this.$element).quic_input).readOnly=true;
                        this.__validatable = false;
                    }else {
                        (<HTMLInputElement>(<any>this.$element).quic_input).readOnly=false;
                        (<HTMLInputElement>(<any>this.$element).quic_input).removeAttribute("readonly");
                        if(this.__permission==="validatable") {this.__validatable=true;}
                    }
                }else {
                    this.__permission = "readonly";
                }
            }
            
            render(decoration?:boolean):HTMLElement{
                let element = this.$element = ctx.createElement("div");
                let id = this.get_viewid() + "_input";
                if(this.$decoration!=undefined) decoration = this.$decoration;
                let perm:string = this.get_permission();
                let inputElement :HTMLElement;
                if(perm==="visible"){
                    inputElement = this.render_visibleonly(); 
                }else {
                    inputElement = this.render_writable();                
                }
                inputElement.className ="quic-input";
                let actualInput = (<any>element).quic_input = (<any>inputElement).quic_input || inputElement;
                (<any>element).quic_wrapFor = inputElement;
                (<any>inputElement).quic_wrapBy =  (<any>actualInput).quic_wrapBy=element;
                (<any>inputElement).quic_view =  (<any>actualInput).quic_view =  (<any>actualInput).quic_view = this;
    
                element.className = this.$css += perm;
                if(perm==="readonly"){
                    this.is_readonly(true);
                }else if(perm==="validatable"){
                    this.__validatable=true;
                }
    
                if(decoration===false){
                    element.appendChild(inputElement);
                }else {
                    let required = this.$validations && this.$validations.required;
                    let html  = '<label for="' + id + '" class="quic-label">' + this.$text 
                    + (required?"<span class='required'>*</span>":"")
                    + '</label><span class="quic-control"></span><label for="'+id+'" class="quic-ins"></label>' ;
                    element.innerHTML = html;
                    element.childNodes[1].appendChild(inputElement);
                }
                actualInput.id=id;
                return element;   
            }
            
            dispose(){
    
            }
            _T(key:string):string{
                return this.$quic._T(key);
            }
            protected init(opts:ViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                this.$opts = opts;
                if(!(this.$quic = quic) && composite) {
                    this.$quic = composite.$quic;
                }
                this.$name = opts.name;
                this.$dataType = opts.dataType || "text";
                this.$viewType = opts.viewType || this.$dataType;
                this.$validations = opts.validations;
                this.$decoration = opts.decoration;
                this.__permission = opts.perm;
                if(this.$composite = composite){
                    this.$idprefix = composite.$idprefix + "_" + this.$name;
                }else {
                    this.$idprefix = this.$name;
                }

                this.$text = opts.text?this.$quic._T(opts.text) : this.$quic._T(this.$name);
                this.$description = opts.desciption ?quic._T(this.$description):"";
                    
                
                let css:string = "";
                if(opts.css) css = opts.css;
                css += " " + this.$name ;
                css += " " + this.$dataType ;
                if(this.$dataType!= this.$viewType) css += " " + this.$viewType;
                css += " ";
                this.$css = css;
                if(model){
                    this.$model = model ;
                }else {
                    if(this.$composite){
                        if(opts.datapath && this.$composite){
                            this.$model = this.$composite.$model.find(opts.datapath) as Models.IModel;
                        }else {
                            this.$model = this.$composite.$model;
                        }
                    }
                    
                }
                
            }
            
    
            protected render_visibleonly(decoration?:boolean):HTMLElement{
                let element = ctx.createElement("span");
                let value = this.get_value();
                element.innerHTML = value===null || value===undefined?"":value;
                element.title = this.$description;
                return element;
            }
            
            protected render_writable(decoration?:boolean):HTMLElement{
                let element:HTMLInputElement = ctx.createElement("input") as HTMLInputElement;
                (<any>element)["quic-view"] = this;
                element.name = this.$name;
                element.type = "text";
                element.placeholder = this.$description;
                let value = this.get_value();
                element.value =  value===null || value===undefined?"":value;
                let tick:number;
                let change = ()=>{
                    if(tick) clearTimeout(tick);
                    this.set_value(element.value);
                    this.validate();
                };
                let delayChange =()=>{
                    if(tick) clearTimeout(tick);
                    tick = setTimeout(change, 200);
                };
                ctx.attach(element,"blur",change);
                ctx.attach(element,"keyup",delayChange);
                ctx.attach(element,"keydown",delayChange);
                return element;
            }
    
            protected setPermissionCss(perm:string):View{
                if(perm==="disabled" || perm==="hidden"){
                    this.$element.style.display="none";
                    return this;
                }else {
                    this.$element.style.display = "block";
                }
                let css = this.$element.className;
                if(!css) {
                    this.$element.className = perm;
                }
                let csses = css.split(" ");
                let cssText = "";
                for(let i = 0,j=csses.length;i<j;i++){
                    let c = csses[i];if(!c) continue;
                    if(c==="visible" || c==="readonly" || c==="editable" || c==="validatable"){
                        continue;
                    }
                    cssText += " " + c;
                }
                this.$element.className = cssText + " " + perm;
                return this;
            }
    
            
            static viewTypes:{[index:string]:any}={"view":View};
            static validators:{[index:string]:any}={};
        }

        export let viewTypes:{[index:string]:any}=View.viewTypes;
        viewTypes.text = View;
        export let validators:{[index:string]:any}=View.validators;
        validators.required = (value:any,validation:any,view:View):boolean=>{
            let val = typeof value == "string"? value.replace(/(^\s+)|(\s+$)/g,""):value;
            if(val)return true;else return false;
        }
    }
}
exports.View = Quic.Views.View;