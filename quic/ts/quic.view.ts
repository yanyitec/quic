namespace Quic{
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

        position?:string;
        validations?:{[index:string]:any};


    }
    export interface ILocalizable{
        
    }
        
    export class View extends Observable{
        name:string;
        dataType:string;
        viewType:string;
        validations:{[index:string]:string};
        text:string;
        description:string;
        
        idprefix:string;
        css:string;
        width?:number;
        element:HTMLElement;
        composite:View;
        opts:ViewOpts;
        
        datasource:IDataSource;
        package:IPackage;
        protected _permission:string;
        protected _originPermission:string;
        protected _validatable?:boolean;
        protected _disabled?:Array<Node>;

        constructor(opts:ViewOpts,composite?:View,datasource?:IDataSource,pack?:IPackage){
            super();
            if(!opts) return;
            this.init(opts,composite, datasource, pack);
        }
        
        id():string{
            let id = this.idprefix + (this.package? this.package.idNo():idNo());
            this.id =()=>id;
            return id;
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
                        ctx.show(element);
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
            let id = this.id + "_input";

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
                let html  = '<label for="' + id + "' class='quic-label'>" + this.text + '</label><span class="quic-control"></span><label for="'+id+'" class="quic-ins"></label>' ;
                element.innerHTML = html;
                element.lastChild.appendChild(inputElement);
            }
            actualInput.id=id;
            return element;   
        }
        

        value(val?:any):any{
            throw new Error("invalid operation");
        }
        dispose(){

        }
        _T(key:string,returnRequired?:boolean):string{
            return (this.package)
                ?this.package._T(key, returnRequired)
                :key;
        }

        protected init(opts:ViewOpts,composite?:View,datasource?:IDataSource,pack?:IPackage){
            this.opts = opts;
            
            this.name = opts.name;
            this.dataType = opts.dataType || "text";
            this.viewType = opts.viewType || this.dataType;
            this.validations = opts.validations;
            this._permission = opts.perm;
            this.text = opts.text || this._T(this.name);
            if(opts.desciption) {
                this.description = this._T(this.description);
            }else this.description = this.text;

            this.composite = composite;
            if(composite){
                this.idprefix = composite.idprefix + "_" + this.name;
                
            }else {
                this.idprefix = this.name;
            }
            let css:string = "";
            if(opts.css) css = opts.css;
            css += " " + this.name ;
            css += " " + this.dataType ;
            if(this.dataType!= this.viewType) css += " " + this.viewType;
            css += " ";
            this.css = css;

            this.datasource = datasource || (composite?composite.datasource:null);
            if(opts.datapath){
                if(opts.datapath[0]==="$" && opts.datapath[1]==="{" && opts.datapath[ opts.datapath.length-1]==="}"){
                    this.value = this.datasource.expr(opts.datapath);
                }else {
                    this.value = this.datasource.access(opts.datapath,this);
                }
            }else {
                this.value = (value:any):any=>{
                    if(value===undefined){
                        return this.datasource.rawData;
                    }
                    this.datasource.data(value);
                };
            }

            if(!(this.package = pack) && this.composite) {
                this.package = this.composite.package;
            }
            
        }

        protected render_visibleonly(decoration?:boolean):HTMLElement{
            let element = ctx.createElement("span");
            element.innerHTML = this.value();
            element.title = this.description;
            return element;
        }
        
        protected render_writable(decoration?:boolean):HTMLElement{
            let element:HTMLInputElement = this.element = ctx.createElement("input") as HTMLInputElement;
            (<any>element)["quic-view"] = this;
            element.name = this.name;
            element.type = "text";
            element.placeholder = this.description;
            element.value = this.value();
            let tick:number;
            let change = ()=>{
                if(tick) clearTimeout(tick);
                this.value(element.value);
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

        static clone(src:View,cloneView:View,composite?:View,datasource?:IDataSource):View{
            
            if(!cloneView) {
                let CLS:any = viewTypes[src.viewType];
                if(!CLS) ctx.throw("invalid viewType");
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
            cloneView.package = src.package;
            if(src.validations){
                let valids ={};
                for(let validname in src.validations){
                    valids[validname] = src.validations[validname];
                }
                cloneView.validations = valids;
            }
            cloneView.composite = composite;
            cloneView.datasource = datasource;
            return cloneView;
        }

        static viewTypes:{[index:string]:any}={"view":View};

    }
    let idseed = 0;
    function idNo(){
        if(++idseed>210000000) idseed=0;
        return idseed;
    }
    export let viewTypes:{[index:string]:any}=View.viewTypes;


}
exports.View = Quic.View;