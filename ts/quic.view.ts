/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.datafield.ts" />

namespace Quic{
    export interface ViewOpts{
       
        name?:string;
        group?:string;
        permission?:string;
        
    }
    export interface ViewDefs extends ViewOpts{
        viewType?:string;
       
    }

    export interface IViewBuilder{
        //只是可见，没有input元素跟着
        visible:(view:IView,data:{[index:string]:any})=>HTMLElement;
        //隐藏，但是有input元素
        hidden:(view:IView,data:{[index:string]:any})=>HTMLElement;
        //只读，不能修改，但是有input元素
        readonly:(view:IView,data:{[index:string]:any})=>HTMLElement;
        // 可编辑
        editable:(view:IView,data:{[index:string]:any})=>HTMLElement;
        // 设置View的值，并让view反映该值。
        setViewValue(view:IView,element:HTMLElement,value:any):any;
        // 获取到该view上的值。
        getViewValue(view:IView,element:HTMLElement):any;
    }

    
    export interface ViewCss{
        visible():string;
        hidden():string;
        readonly():string;
        editable():string;
        toString():string;
    }
    export interface IView extends ViewDefs{
        
        viewBuilder:IViewBuilder;
        Css?:ViewCss;
        container?:IViewset;
        viewValue(element:HTMLElement,value?:any):any;
        
        createElement(value:any,permission:string,validateRequired?:boolean,state?:any):HTMLElement;
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

    
    export let viewBuilders: {[viewType:string]:IViewBuilder} ={};
    export class TextBuilder implements IViewBuilder{
        constructor(){}
        //只是可见，没有input元素跟着
        visible(view:IView,value:any):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.innerHTML = value===undefined||value===null?"":value;
            return element;
        }
        //隐藏，但是有input元素
        hidden(view:IView,value:any):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.type="hidden";
            element.value = value===undefined||value===null?"":value;
            return element;
        }
        //只读，不能修改，但是有input元素
        readonly(view:IView,value:any):HTMLElement{
            let element:HTMLSpanElement = Quic.dom.createElement("span") as HTMLSpanElement;
            value = value===undefined||value===null?"":value;
            element.innerHTML=`<span>${value}</span><input type="hidden" name="${view.name}" />`;
            (element.lastChild as HTMLInputElement).value = value;
            return element;
        }
        // 可编辑
        editable(view:IView,value:any):HTMLElement{
            let element:HTMLInputElement = Quic.dom.createElement("input") as HTMLInputElement;
            element.type = "text";
            element.value = value===undefined||value===null?"":value;
            return element;
        }
        // 设置View的值，并让view反映该值。
        setViewValue(view:IView,element:HTMLElement,value:any):any{
            if(element.tagName==="INPUT"){
                (element as HTMLInputElement).value=value;
            }else{
                (element.lastChild as HTMLInputElement).value=value;
            }
        }
        // 获取到该view上的值。
        getViewValue(view:IView,element:HTMLElement):any{
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
            this.editable = (view:IView,value:any):HTMLElement=>{
                let element:HTMLInputElement = Quic.dom.createElement("textarea") as HTMLInputElement;
                element.value = value===undefined||value===null?"":value;
                return element;
            };
        }
    }
    viewBuilders.textarea = new TextareaBuilder();
}