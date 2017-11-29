/// <reference path="quic.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.data.ts" />
/// <reference path="quic.view.ts" />
namespace Quic{
    
    export interface FieldOpts extends DataFieldOpts,ViewOpts{
        text?:string;
        group?:string;
        css?:string;
    }
    

    export class Field extends DataField implements View{
        viewType:string;
        css:ViewCss;
        container:View;
        builder:ViewBuilder;
        text:string;
        group:string;
        constructor(container:View,opts:FieldOpts){
            super(opts);
            this.container = container;
            this.text = opts.text;
            if(!(this.viewType = opts.viewType)){this.viewType = this.dataType;}
            if(!(this.builder = viewBuilders[this.viewType]))
                throw new Error("Invalid viewType:" + this.viewType + ". viewBuilder is not found.");

            let css = "field " + this.viewType + " " + this.name;
            if(opts.css) css +=" " + opts.css;
            this.css = new ViewCSS(css);
        }
        

        value(data:{[index:string]:any},element?:any,value?:any):any{
            if(isHtmlNode(data)){
                value = element;
                element = data;
                data = undefined;
            }else if(!isHtmlNode(element)){
                value = element;
                element = undefined;
            }
            
            if(value===undefined){
                if(element){
                    value = this.builder.getViewValue(this,element as HTMLElement);
                    if(data) super.value(data,value);
                } else if(data){
                    value = super.value(data);
                }else {
                    throw new Error("must have element or data.");
                }
                return value;
            }else {
                if(element){
                    this.builder.setViewValue(this,element,value);
                    if(data) super.value(data,value);
                }else if(data){
                    super.value(data,value);
                }else{
                    throw new Error("must have element or data.");
                }
                return this;
            }
        }
        
        viewValue(element?:any,value?:any):any{
            if(value===undefined) return this.builder.getViewValue(this,element);
            this.builder.getViewValue(this,element);
            return this;
        }
        viewValidate(element?:HTMLElement,data?:{[index:string]:any},state?:any):string{
            let value = this.builder.getViewValue(this,element);
            if(data) this.dataValue(data,value);
            let validType:string =  this.dataValidate(value,state);
            if(validType){
                let wrapper:HTMLElement = element.parentNode as HTMLElement;
                while(wrapper){
                    if(wrapper["quic-field"]) break;
                }
                if(wrapper){
                    let ul = wrapper["quic-validation-infos"] as HTMLUListElement;
                    let showErrorInfo = (validType)=>{
                        for(let i=0,j=ul.childNodes.length;i<j;i++){
                            let li = ul.childNodes[i] as HTMLLIElement;
                            if((li as any).name===validType) li.className="error";
                            else li.className="";
                        }
                    };
                    let dom :Dom = Quic.dom;
                    if(validType) {
                        showErrorInfo(validType);
                        dom.addClass(wrapper,"validate-error").removeClass(wrapper,"validate-success");
                    }else {
                        dom.removeClass(wrapper,"validate-error");
                        if(validType===null){
                            dom.addClass(wrapper,"validate-processing");
                        }else dom.addClass(wrapper,"validate-success");
                    }
                }
            }
            
            return validType;
            
        }
        

        createElement(data:{[index:string]:any},permission:string,validateRequired?:boolean):HTMLElement{
            let creator = (this.builder as any)[permission];
            if(!creator) throw new Error("Invalid permission value:" + permission);
            let cssor = (this.css as any)[permission];
            if(!cssor) throw new Error("Invalid permission value:" + permission);
            let dom :Dom = Quic.dom;
            let element = dom.createElement("div");
            (element as any)["quic-field"] = this;
            element.className = cssor();
            if(permission==="hidden")element.style.display="none";
            let id = "quic_input_"+(Quic as any).nextGNo();
            let text = this.text || (this._T?this._T(this.name):this.name);
            let required = (this.validations && this.validations.required)?"<ins class='field-required'>*</ins>":"";
            element.innerHTML = `<label class="field-caption" for="${id}">${text}${required}</label>`;
            let input = creator(this,data);let validInput = input["quic-valid-input"]||input;
            input.name = this.name;validInput.id= id;
            element.appendChild(input);
            let validInfos = this.validationInfos(this._T,this._accessorFactory);
            if(validateRequired===true && permission==="editable" && validInfos){
                let info = document.createElement("label") as HTMLLabelElement;
                (info as any).for = id;
                info.className="field-valid-infos";
                element.appendChild(info);
                
                let validTick;
                let ul:HTMLUListElement = dom.createElement("ul") as HTMLUListElement;
                ul.className="validation-infos";
                for(let n in validInfos){
                    let li = dom.createElement("li");
                    (li as any).name = n;
                    li.innerHTML = validInfos[n];
                    ul.appendChild(li);
                }
                (element as any)["quic-validation-infos"]=ul;
                let valid =()=>{
                    if(validTick) clearTimeout(validTick);
                    validTick=0;
                    this.viewValidate(input);
                };
                let delayValid = ()=>{
                    if(validTick) clearTimeout(validTick);
                    validTick = setTimeout(() => {
                        if(validTick) clearTimeout(validTick);
                        validTick=0;
                        this.viewValidate(input);
                        
                    }, 200);
                }
                dom.attach(validInput,"keydown",delayValid);
                dom.attach(validInput,"keyup",delayValid);
                dom.attach(validInput,"change",valid);
                dom.attach(validInput,"blur",valid);
            }
            
            return element;
        }

        
        
        //static viewBuilders:{[viewType:string]:ViewBuilder}={};
    }
    export function getExactType(obj:any):string{
        let t = typeof obj;
        if(t==="object"){
            if(t===null)return "null";
            if(obj instanceof RegExp) return "regex";
            if(obj.nodeType!==undefined && obj.appendChild && obj.getAttribute) return "HTMLElement";
            if(Object.prototype.toString.call(obj)==="[object Array]")return "array";
        }
        return t;
    }
    export function extend(dest:any,src:any,arg2?:any,arg3?:any,arg4?:any,arg5?:any,arg6?:any,arg7?:any,arg8?:any):any{
       
        if(!src) return dest;
        if(!dest) dest={};
        for(var n in src){
            let srcValue = src[n];
            let destValue = dest[n];
            let srcValueType = getExactType(srcValue);
            let destValueType = getExactType(destValue);
            if(srcValueType==="object"){
                if(destValueType!=="object") destValue = dest[n] = {};
                extend(destValue,srcValue);
            }else if(srcValueType==="array"){
                if(destValueType!=="object" && destValueType!=="array" && destValueType!=="function") destValue = dest[n] = [];
                extend(destValue,srcValue);
            }else {
                if(destValue===undefined) dest[n] = srcValue;
            }
        }
        for(let i=2,j=arguments.length;i<j;i++){
            extend(dest,arguments[i]);
        }
        return dest;
    }
    
}