/// <reference path="quic.data.ts" />
namespace Quic{
    export interface ViewUtility{
        createElement:(tagName:string)=>HTMLElement;
        attach(element:HTMLElement,evt:string,handler:Function):void;
        detach(element:HTMLElement,evt:string,handler:Function):void;
        addClass(element:HTMLElement,css:string);
        removeClass(element:HTMLElement,css:string);
        //hasClass(element:HTMLElement,css:string);
        alert(msg:string);
        confirm(msg:string);
        error:Function;
        warn:Function;
    }
    export let utils:ViewUtility;
    let idNo:number = 0;
    export function nextIdNo(){
        if(idNo++>2100000000) idNo= -2100000000;
        return idNo;
    }

    export interface ViewBuilder{
        //只是可见，没有input元素跟着
        visible:(view:View,data:{[index:string]:any})=>HTMLElement;
        //隐藏，但是有input元素
        hidden:(view:View,data:{[index:string]:any})=>HTMLElement;
        //只读，不能修改，但是有input元素
        readonly:(view:View,data:{[index:string]:any})=>HTMLElement;
        // 可编辑
        editable:(view:View,data:{[index:string]:any})=>HTMLElement;
        // 设置View的值，并让view反映该值。
        setViewValue(view:View,element:HTMLElement,value:any):any;
        // 获取到该view上的值。
        getViewValue(view:View,element:HTMLElement):any;
    }
    export interface ViewOpts{
        viewType?:string;
        css?:string;
    }
    export interface FieldViewOpts extends DataFieldOpts,ViewOpts{
        text?:string;
        
    }
    export interface ViewCss{
        visible():string;
        hidden():string;
        readonly():string;
        editable():string;
    }
    export interface View{
        name:string;
        viewType:string;
        css:ViewCss;
    }
    class ViewCSS implements ViewCss{
        constructor(base:string){this.base = base;}
        base:string;
        visible=():string=>{
            let css = this.base + " field-visible";
            this.visible =():string=>css;
            return css;
        }
        hidden=():string=>{
            let css = this.base + " field-hidden";
            this.hidden =():string=>css;
            return css;
        }
        readonly=():string=>{
            let css = this.base + " field-readonly";
            this.readonly =():string=>css;
            return css;
        }
        editable=():string=>{
            let css = this.base + " field-editable";
            this.editable =():string=>css;
            return css;
        }

    }

    export class FieldView extends DataField implements View{
        viewType:string;
        css:ViewCss;
        container:View;
        builder:ViewBuilder;
        text:string;
        
        constructor(container?:View,opts?:FieldViewOpts){
            super();
            this.container = container;
            
            if(opts) this.setOpts(opts);
           
        }
        setOpts(opts:FieldViewOpts):FieldView{
            super.setOpts(opts);
            if(opts.text)this.text = opts.text;
            if(!this.viewType){
                if(!(this.viewType = opts.viewType)){this.viewType = this.dataType;}
                if(!(this.builder = viewBuilders[this.viewType]))
                    throw new Error("Invalid viewType:" + this.viewType + ". viewBuilder is not found.");
                
            }else if(opts.viewType && this.viewType !==opts.viewType) {
                if(!(this.builder= viewBuilders[opts.viewType]))
                    throw new Error("Invalid viewType:" + opts.viewType + ". viewBuilder is not found.");
                this.viewType = opts.viewType;
            }
            let css = "field " + this.viewType + " " + this.name;
            if(opts.css) css +=" " + opts.css;
            this.css = new ViewCSS(css);
            return this;
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
        viewValidate(element?:HTMLElement,data?:{[index:string]:any}):{[validType:string]:string}{
            let value = this.builder.getViewValue(this,element);
            if(data) this.dataValue(data,value);
            var result =  this.dataValidate(value);
            if(result){
                let wrapper:HTMLElement = element.parentNode as HTMLElement;
                while(wrapper){
                    if(wrapper["quic-field"]) break;
                }
                if(wrapper){
                    let ul = wrapper["quic-validation-infos"] as HTMLUListElement;
                    let showErrorInfo = (result:{[index:string]:string})=>{
                        for(let i=0,j=ul.childNodes.length;i<j;i++){
                            let li = ul.childNodes[i] as HTMLLIElement;
                            if(result[(li as any).name]) li.className="error";
                            else li.className="";
                        }
                    };
                    if(result) {
                        showErrorInfo(result);
                        utils.addClass(wrapper,"validate-error").removeClass(wrapper,"validate-success");
                    }else {
                        utils.removeClass(wrapper,"validate-error").addClass(wrapper,"validate-success");
                    }
                }
            }
            
            return result;
            
        }
        

        createElement(data:{[index:string]:any},permission:string,validateRequired?:boolean):HTMLElement{
            let creator = (this.builder as any)[permission];
            if(!creator) throw new Error("Invalid permission value:" + permission);
            let cssor = (this.css as any)[permission];
            if(!cssor) throw new Error("Invalid permission value:" + permission);

            let element = utils.createElement("div");
            (element as any)["quic-field"] = this;
            element.className = cssor();
            if(permission==="hidden")element.style.display="none";
            let id = "quic_input_"+nextIdNo();
            let text = this.text || (this._T?this._T(this.name):this.name);
            let required = (this.validations && this.validations.required)?"<ins class='field-required'>*</ins>":"";
            element.innerHTML = `<label class="field-caption" for="${id}">${text}${required}</label>`;
            let input = creator(this,data);let validInput = input["quic-valid-input"]||input;
            input.name = this.name;validInput.id= id;
            element.appendChild(input);
            let validInfos = this.validationInfos();
            if(validateRequired===true && permission==="editable" && validInfos){
                let info = document.createElement("label") as HTMLLabelElement;
                (info as any).for = id;
                info.className="field-valid-infos";
                element.appendChild(info);
                
                let validTick;
                let ul:HTMLUListElement = utils.createElement("ul") as HTMLUListElement;
                ul.className="validation-infos";
                for(let n in validInfos){
                    let li = utils.createElement("li");
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
                utils.attach(validInput,"keydown",delayValid);
                utils.attach(validInput,"keyup",delayValid);
                utils.attach(validInput,"change",valid);
                utils.attach(validInput,"blur",valid);
            }
            
            return element;
        }
        
        //static viewBuilders:{[viewType:string]:ViewBuilder}={};
    }
    export function isHtmlNode(node:any){
        return node.nodeType!==undefined && node.getAttribute && node.appendChild;
    }
    export let viewBuilders: {[viewType:string]:ViewBuilder} ={};
    export class TextBuilder implements ViewBuilder{
        constructor(){}
        //只是可见，没有input元素跟着
        visible(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLInputElement = utils.createElement("input") as HTMLInputElement;
            let value= (view as FieldView).dataValue(data);
            element.innerHTML = value===undefined||value===null?"":value;
            return element;
        }
        //隐藏，但是有input元素
        hidden(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLInputElement = utils.createElement("input") as HTMLInputElement;
            element.type="hidden";
            let value= (view as FieldView).dataValue(data);
            element.value = value===undefined||value===null?"":value;
            return element;
        }
        //只读，不能修改，但是有input元素
        readonly(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLSpanElement = utils.createElement("span") as HTMLSpanElement;
            let value = (view as FieldView).dataValue(data);
            value = value===undefined||value===null?"":value;
            element.innerHTML=`<span>${value}</span><input type="hidden" name="${view.name}" />`;
            (element.lastChild as HTMLInputElement).value = value;
            return element;
        }
        // 可编辑
        editable(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLInputElement = utils.createElement("input") as HTMLInputElement;
            element.type = "text";
            let value= (view as FieldView).dataValue(data);
            element.value = value===undefined||value===null?"":value;
            return element;
        }
        // 设置View的值，并让view反映该值。
        setViewValue(view:View,element:HTMLElement,value:any):any{
            if(element.tagName==="INPUT"){
                (element as HTMLInputElement).value=value;
            }else{
                (element.lastChild as HTMLInputElement).value=value;
            }
        }
        // 获取到该view上的值。
        getViewValue(view:View,element:HTMLElement):any{
            if(element.tagName==="INPUT"){
                return (element as HTMLInputElement).value;
            }else{
                return (element.lastChild as HTMLInputElement).value;
            }
        }
    };
    viewBuilders.text = viewBuilders.number = viewBuilders.int = viewBuilders.string = new TextBuilder();
    class TextareaBuilder extends TextBuilder{
        constructor(){
            super();
            this.editable = (view:View,data:{[index:string]:any}):HTMLElement=>{
                let element:HTMLInputElement = utils.createElement("textarea") as HTMLInputElement;
                let value= (view as FieldView).dataValue(data);
                element.value = value===undefined||value===null?"":value;
                return element;
            };
        }
    }
    viewBuilders.textarea = new TextareaBuilder();
    
}