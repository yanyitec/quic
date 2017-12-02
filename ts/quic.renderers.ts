/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />


namespace Quic{
    export let renderers :{[viewType:string]:IRenderer}={};

    export class TextRenderer implements IRenderer{
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
    renderers.text = renderers.number = renderers.int = renderers.string = new TextRenderer();
    class TextareaRenderer extends TextRenderer{
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
    renderers.textarea = new TextareaRenderer();

    
    
    
}