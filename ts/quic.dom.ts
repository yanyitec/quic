namespace Quic{
    export interface Dom{
        createElement:(tagName:string)=>HTMLElement;
        attach(element:HTMLElement,evt:string,handler:Function):void;
        detach(element:HTMLElement,evt:string,handler:Function):void;
        addClass(element:HTMLElement,css:string);
        removeClass(element:HTMLElement,css:string);
        hasClass(element:HTMLElement,css:string);
    }
    
    export let dom:Dom;
}
