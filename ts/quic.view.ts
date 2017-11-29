/// <reference path="quic.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.data.ts" />

namespace Quic{
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
    export class ViewCSS implements ViewCss{
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

    export function isHtmlNode(node:any){
        return node.nodeType!==undefined && node.getAttribute && node.appendChild;
    }
    export let viewBuilders: {[viewType:string]:ViewBuilder} ={};
    export class TextBuilder implements ViewBuilder{
        constructor(){}
        //只是可见，没有input元素跟着
        visible(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            let value= (view as Field).dataValue(data);
            element.innerHTML = value===undefined||value===null?"":value;
            return element;
        }
        //隐藏，但是有input元素
        hidden(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.type="hidden";
            let value= (view as Field).dataValue(data);
            element.value = value===undefined||value===null?"":value;
            return element;
        }
        //只读，不能修改，但是有input元素
        readonly(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLSpanElement = Quic.dom.createElement("span") as HTMLSpanElement;
            let value = (view as Field).dataValue(data);
            value = value===undefined||value===null?"":value;
            element.innerHTML=`<span>${value}</span><input type="hidden" name="${view.name}" />`;
            (element.lastChild as HTMLInputElement).value = value;
            return element;
        }
        // 可编辑
        editable(view:View,data:{[index:string]:any}):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.type = "text";
            let value= (view as Field).dataValue(data);
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
                let element:HTMLInputElement = Quic.dom.createElement("textarea") as HTMLInputElement;
                let value= (view as Field).dataValue(data);
                element.value = value===undefined||value===null?"":value;
                return element;
            };
        }
    }
    viewBuilders.textarea = new TextareaBuilder();
}