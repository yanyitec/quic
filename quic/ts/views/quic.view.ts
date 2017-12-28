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
            name:string;
            dataType:string;
            viewType:string;
            validations:{[index:string]:string};
            text:string;
            description:string;
            decoration:boolean;
            idprefix:string;
            css:string;
            width?:number;
            element:HTMLElement;
            composite:View;
            opts:ViewOpts;
            
            model:Models.IModel;
            quic:IQuicInstance;
            protected _permission:string;
            protected _originPermission:string;
            protected _validatable?:boolean;
            protected _disabled?:Array<Node>;
    
            constructor(opts:ViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super();
                if(!opts) return;
                this.init(opts,composite, model, quic);
            }
            
            id():string{
                let id = this.idprefix + GNo(this.idprefix);
                this.id =()=>id;
                return id;
            }

            value(value?:any):any{
                if(value===undefined) return this.model.get_value();
                if(value==="quic:undefined") this.model.set_value(undefined);
                this.model.set_value(value);
                return this;
            }

            validate(state?:any){
                if(!this._validatable || !this.validations)return true;
                let value = this.value();
                let result:boolean;
                let element = this.element;
                let tipElement = (element.lastChild || element) as HTMLElement;
                for(let n in this.validations){
                    let validator = validators[n];
                    if(!validator){
                        ctx.warn("unregistered validation",n);
                        continue;
                    }
                    let validation = this.validations[n];
                    result = validator(value,validation,this);
                    if(element){
                        if(result===false){
                            ctx.removeClass(element,"quic-validation-success");
                            ctx.removeClass(element,"quic-validation-validating");
                            ctx.addClass(element,"quic-validation-error");
                            let tip = tipElement.title = str_replace(this._T("-valid-" + n),validation);
                            if(state) state[this.name] = {
                                message:tip,
                                name:this.name,
                                id:this.id,
                                text:this.text
                            };
                        }else if(result===null){
                            ctx.addClass(element,"quic-validation-success");
                            ctx.removeClass(element,"quic-validation-validating");
                            ctx.removeClass(element,"quic-validation-error");
                            tipElement.title = "";
                        }else{
                            ctx.removeClass(element,"quic-validation-error");
                            ctx.addClass(element,"quic-validation-validating");
                            ctx.removeClass(element,"quic-validation-success");
                            tipElement.title = "";
                        }
                    }
                    
                }
                return result;
            }
    
            disabled(value?:boolean){
                if(value===undefined){return this._disabled!==undefined;} 
                if(value===false){
                    if(this._disabled){
                        this.element.style.display="";
                        for(let i =0,j= this._disabled.length;i<j;i++){
                            this.element.appendChild(this._disabled[i]);
                        }
                        this._disabled=undefined;
                    }
                    return this;
                }else {
                    if(this._disabled) return this;
                    this.element.style.display="none";
                    this._disabled =[];
                    for(let i =0 ,j=this.element.childNodes.length;i<j;i++){
                        this._disabled.push(this.element.firstChild);
                        this.element.removeChild(this.element.firstChild);
                    }
                    return this;
                }
            }
    
            permission(value?:string):any{
                if(value===undefined) {
                    if(this._permission===undefined){
                        if(this.composite) this._permission = this._originPermission = (this.composite.permission() || "validatable") as string;
                        else this._permission = this._originPermission ="validatable";
                    }
                    return this._permission;
                }
                
                if(this._permission!==value){
                    let oldPerm = this._permission;
                    
                    if(this.element){
                        if(value==="quic:reset"){
                            return this.permission(this._originPermission);
                        }
                        this._permission = value;
                        
                        let element:HTMLElement = (<any>this.element);
                        if(value==="disabled"){
                            return this.disabled(true);
                        }else {
                            this.disabled(false);
                        }
                        let wrapper = (<any>this.element).quic_wrapFor.parentNode;
                        
                        if(value==="visible"){
                            this.setPermissionCss("visible");
                            wrapper.innerHTML = "";
                            let inputElement = this.render_visibleonly();
                            wrapper.appendChild(inputElement);  
                            this._validatable=false;
                            return this;                   
                        }
                        if(oldPerm==="visible" || oldPerm==="disabled"){
                            let inputElement = this.render_writable();
                            wrapper.appendChild(inputElement);  
                        }
                        if(value==="hidden"){
                            this.setPermissionCss("hidden");
                            this._validatable=false;
                        }else if(value==="readonly"){
                            this.setPermissionCss("readonly");
                            this.readonly(true);
                            this._validatable=false;
                            element.style.display="";
                        }else if(value==="writable"){
                            this.setPermissionCss("writable");
                            this.readonly(false);
                            this._validatable = false;
                            
                        }else if(value==="validatable"){
                            this.setPermissionCss("validatable");
                            this._validatable = true;
                        }
                    }else {
                        this._permission = value==="quic:reset"?this._originPermission:value;
                    }
                }
                return this;
                
            }
            readonly(value?:boolean):any{
                let perm = this.permission();
                if(value===undefined) {
                    return perm==="visible" || perm==="readonly";
                }
                if(perm==="disabled" || perm==="visible" || perm ==="readonly") return this;
                if(this.element){
                    if(value===true){
                        (<HTMLInputElement>(<any>this.element).quic_input).readOnly=true;
                        this._validatable = false;
                    }else {
                        (<HTMLInputElement>(<any>this.element).quic_input).readOnly=false;
                        (<HTMLInputElement>(<any>this.element).quic_input).removeAttribute("readonly");
                        if(this._permission==="validatable") {this._validatable=true;}
                    }
                }else {
                    this._permission = "readonly";
                }
            }
            
            render(decoration?:boolean):HTMLElement{
                let element = this.element = ctx.createElement("div");
                let id = this.id() + "_input";
                if(this.decoration!=undefined) decoration = this.decoration;
                let perm:string = this.permission();
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
    
                element.className = this.css += perm;
                if(perm==="readonly"){
                    this.readonly(true);
                }else if(perm==="validatable"){
                    this._validatable=true;
                }
    
                if(decoration===false){
                    element.appendChild(inputElement);
                }else {
                    let html  = '<label for="' + id + '" class="quic-label">' + this.text + '</label><span class="quic-control"></span><label for="'+id+'" class="quic-ins"></label>' ;
                    element.innerHTML = html;
                    element.childNodes[1].appendChild(inputElement);
                }
                actualInput.id=id;
                return element;   
            }
            
            dispose(){
    
            }
            _T(key:string):string{
                return this.quic._T(key);
            }
            protected init(opts:ViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                this.opts = opts;
                if(!(this.quic = quic) && composite) {
                    this.quic = composite.quic;
                }
                this.name = opts.name;
                this.dataType = opts.dataType || "text";
                this.viewType = opts.viewType || this.dataType;
                this.validations = opts.validations;
                this.decoration = opts.decoration;
                this._permission = opts.perm;
                if(this.composite = composite){
                    this.idprefix = composite.idprefix + "_" + this.name;
                }else {
                    this.idprefix = this.name;
                }

                this.text = opts.text?this.quic._T(opts.text) : this.quic._T(this.name);
                this.description = opts.desciption ?quic._T(this.description):"";
                    
                
                let css:string = "";
                if(opts.css) css = opts.css;
                css += " " + this.name ;
                css += " " + this.dataType ;
                if(this.dataType!= this.viewType) css += " " + this.viewType;
                css += " ";
                this.css = css;
                if(model){
                    this.model = model ;
                }else {
                    if(this.composite){
                        if(opts.datapath && this.composite){
                            this.model = this.composite.model.find(opts.datapath) as Models.IModel;
                        }else {
                            this.model = this.composite.model;
                        }
                    }
                    
                }
                
            }
            
    
            protected render_visibleonly(decoration?:boolean):HTMLElement{
                let element = ctx.createElement("span");
                let value = this.value();
                element.innerHTML = value===null || value===undefined?"":value;
                element.title = this.description;
                return element;
            }
            
            protected render_writable(decoration?:boolean):HTMLElement{
                let element:HTMLInputElement = this.element = ctx.createElement("input") as HTMLInputElement;
                (<any>element)["quic-view"] = this;
                element.name = this.name;
                element.type = "text";
                element.placeholder = this.description;
                let value = this.value();
                element.value =  value===null || value===undefined?"":value;
                let tick:number;
                let change = ()=>{
                    if(tick) clearTimeout(tick);
                    this.value(element.value);
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
                    this.element.style.display="none";
                    return this;
                }else {
                    this.element.style.display = "block";
                }
                let css = this.element.className;
                if(!css) {
                    this.element.className = perm;
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
                this.element.className = cssText + " " + perm;
                return this;
            }
    
            static clone(src:View,cloneView:View,composite?:View,model?:Models.IModel):View{
                
                if(!cloneView) {
                    let CLS:any = viewTypes[src.viewType];
                    if(!CLS) throw new Error("invalid viewType");
                    cloneView= new CLS(null) as View;
                }
                cloneView.name = src.name;
                cloneView.dataType = src.dataType;
                cloneView.viewType = src.viewType;
                cloneView.value = src.value;
                cloneView.text = src.text;
                cloneView.css = src.css;
                cloneView.description = src.description;
                cloneView.idprefix = src.idprefix;
                cloneView.quic = src.quic;
                if(src.validations){
                    let valids ={};
                    for(let validname in src.validations){
                        valids[validname] = src.validations[validname];
                    }
                    cloneView.validations = valids;
                }
                cloneView.composite = composite;
                cloneView.model = model;
                return cloneView;
            }
    
            static viewTypes:{[index:string]:any}={"view":View};
            static validators:{[index:string]:any}={};
        }

        export let viewTypes:{[index:string]:any}=View.viewTypes;
        export let validators:{[index:string]:any}=View.viewTypes;
    }
}
exports.View = Quic.Views.View;