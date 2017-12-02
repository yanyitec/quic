/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />


namespace Quic{
    export class TextBuilder implements IViewRenderer{
        constructor(){}
        //只是可见，没有input元素跟着
        visible(view:IView):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("span") as HTMLInputElement;
            //element.innerHTML = value===undefined||value===null?"":value;
            return element;
        }
        //隐藏，但是有input元素
        hidden(view:IView):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.type="hidden";
            element.name = view.name;
            return element;
        }
        //只读，不能修改，但是有input元素
        readonly(view:IView):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.type="text";element.readOnly = true;
            element.name = view.name;
            return element;
        }
        // 可编辑
        editable(view:IView):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.type = "text";
            element.name = view.name;
            return element;
        }
        // 设置View的值，并让view反映该值。
        setValue(view:IView,value:any):any{
            let element:HTMLElement = view.element();
            value = value===undefined || value===null?"":value.toString();
            if(element.tagName==="INPUT"){
                (element as HTMLInputElement).value=value;
            }else if(view.permission==="visible"){
                (element.firstChild as HTMLSpanElement).innerHTML = value;
            }else{
                (element.firstChild as HTMLSpanElement).innerHTML = (element.lastChild as HTMLInputElement).value=value;
            }
        }
        // 获取到该view上的值。
        getValue(view:IView):any{
            let element:HTMLElement = view.element();
            if(element.tagName==="INPUT"){
                return (element as HTMLInputElement).value;
            }else if(view.permission==="visible"){
                return (element.firstChild as HTMLSpanElement).innerHTML;
            }else{
                return (element.lastChild as HTMLInputElement).value;
            }
        }
    };
    viewBuilders.text = viewBuilders.number = viewBuilders.int = viewBuilders.string = new TextBuilder();
    class TextareaBuilder extends TextBuilder{
        constructor(){
            super();
            this.editable = (view:IView):HTMLElement=>{
                let element:HTMLInputElement = Quic.dom.createElement("textarea") as HTMLInputElement;
                element.name = view.name;
                return element;
            };
            this.readonly = (view:IView):HTMLElement=>{
                let element:HTMLInputElement = Quic.dom.createElement("textarea") as HTMLInputElement;
                element.name = view.name;element.readOnly = true;
                return element;
            };
        }
    }
    viewBuilders.textarea = new TextareaBuilder();

    export function createFieldElement(view:IView):HTMLElement{
        let field = view.field;
        let permission = view.permission;
        let creator : ICreateView = (this as any)[permission];
        if(!creator) throw new Error("Invalid permission value:" + permission);
        let cssor = (view.Css as any)[view.permission];
        if(!cssor) throw new Error("Invalid permission value:" + permission);
        let element = dom.createElement("div");
        
        element.className = cssor();
        if(permission==="hidden")element.style.display="none";
        let id = "quic_input_"+(Quic as any).nextGNo();
        let text = this.text || field.fieldset._T(this.text) || field.fieldset._T(this.name);
        let required = (view.validatable && field.hasValidation("required"))?"<ins class='field-required'>*</ins>":"";
        element.innerHTML = `<label class="field-caption" for="${id}">${text}${required}</label>`;
        let input = creator(view);
        let forcusElement = input["quic-label-focus-element"]||input;
        forcusElement.id= id;
        element.appendChild(input);
        let validInfos = field.validationInfos(this.fieldset);
        if(view.validatable && permission==="editable" && validInfos){
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
            dom.attach(forcusElement,"keydown",delayValid);
            dom.attach(forcusElement,"keyup",delayValid);
            dom.attach(forcusElement,"change",valid);
            dom.attach(forcusElement,"blur",valid);
        }
        
        return element;
    }
    
    
}