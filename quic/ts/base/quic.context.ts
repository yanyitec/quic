/// <reference path="quic.promise.ts" />
/// <reference path="quic.transport.ts" />
namespace Quic{
    /**
     * 环境容器的抽象
     * 
     * @export
     * @interface IContext
     */
    export interface IContext{
        /**
         * 环境类型
         * browser,node
         * @type {string}
         * @memberof IContext
         */
        type:string;
        /**
         * 跳转浏览器的url
         * 
         * @param {string} url 要跳转的url
         * @param {(doc?:HTMLDocument)=>void} complete 跳转完成后的回调??真的可以回调？？？？
         * @memberof IContext
         */
        navigate(url:string,complete:(doc?:HTMLDocument)=>void);

        /**
         * 调用ajax方法
         * 
         * @param {*} opts 
         * @returns {*} 
         * @memberof IContext
         */
        ajax(opts:any):IPromise;
        /**
         * 加载脚本
         * 
         * @param {string} url 
         * @returns {IPromise} 
         * @memberof IContext
         */
        loadScript(url:string,extras?:any):IPromise;
        /**
         * 加载是样表
         * 
         * @param {string} url 
         * @returns {IPromise} 
         * @memberof IContext
         */
        loadCss(url:string,extras?:any):IPromise;
        /**
         * 加载文本内容
         * 
         * @param {string} url 
         * @returns {IPromise} 
         * @memberof IContext
         */
        loadContent(url:string,extras?:any):IPromise;

        /**
         * 弹出一个警告框，icon为感叹号
         * 
         * @param {string} message 要显示的提示信息
         * @param {string} [title] 标题
         * @returns {IPromise} 
         * @memberof IContext
         */
        alert(message:string,title?:string):IPromise;
        /**
         * 弹出一个确认框，icon为问号
         * 
         * @param {string} message 要显示的确认信息 
         * @param {string} [title] 
         * @returns {IPromise} 
         * @memberof IContext
         */
        confirm(msg:string,title?:string):Promise;
        info:Function;
        /**
         * 对控制台error的抽象
         * 
         * @type {Function}
         * @memberof IContext
         */
        error:Function;
        /**
         * 对控制台警告的抽象
         * 
         * @type {Function}
         * @memberof IContext
         */
        warn:Function;
        /**
         * 创建Dom元素
         * 
         * @param {string} tagName 元素标签
         * @returns {HTMLElement} 创建的元素对象
         * @memberof Dom
         */
        createElement(tagName:string):HTMLElement;

        /**
         * 根据tagName获取文档
         * 
         * @param {string} tagName 
         * @param {string} context 
         * @returns {Array<HTMLElement>} 
         * @memberof Dom
         */
        getElementsByTagName(tagName:string,context?:HTMLElement):Array<HTMLElement>;
        /**
         * 给元素添加事件监听
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        attach(element:HTMLElement,evtname:string,listener:Function):void;
        /**
         * 移除元素上的事件监听
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        detach(element:HTMLElement,evtname:string,listener:Function):void;
        /**
         * 给元素添加css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要添加的css
         * @memberof Dom
         */
        addClass(element:HTMLElement,css:string):void;
         /**
         * 移除元素上的css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要移除的css
         * @memberof Dom
         */
        removeClass(element:HTMLElement,css:string):void;
        /**
         * 检查元素上是否具有某个css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要检测的css
         * @returns {boolean} 是否存在
         * @memberof Dom
         */
        hasClass(element:HTMLElement,css:string);   
        /**
         * 设置/获取某个元素的式样值
         * 
         * @param {*} element 元素
         * @param {string} name 式样名
         * @param {string} [value] 式样值.undefined表示获取
         * @returns {*} 获取时，返回式样值
         * @memberof IContext
         */
        style(element:HTMLElement,name:string,value?:string):any; 
        /**
         * 设置/获取某个元素的透明度值
         * 
         * @param {HTMLElement} element 
         * @param {number} [value] 
         * @returns {*} 
         * @memberof IContext
         */
        opacity(element:HTMLElement,value?:number):any;
        show(element:HTMLElement,animation?:boolean);
        hide(element:HTMLElement,animation?:boolean);
    }
    export class Exception extends Error{
        constructor(message:string,...args:Array<any>){
            super(message);
            for(let i in args) this[i] = args[i];
        }

    }

    let head:HTMLHeadElement;
   

    class BrowserContext{
        constructor(){
            this.ajax = transport;
            this.warn = (...args)=>console.warn.apply(console,args);
            this.error = (...args)=>console.error.apply(console,args);
            this.info =  (...args)=>console.log.apply(console,args);
        }
        /**
         * 环境类型
         * browser,node
         * @type {string}
         * @memberof IContext
         */
        type:string="browser";
        /**
         * 跳转浏览器的url
         * 
         * @param {string} url 要跳转的url
         * @param {(doc?:HTMLDocument)=>void} complete 跳转完成后的回调??真的可以回调？？？？
         * @memberof IContext
         */
        navigate(url:string,complete:(doc?:HTMLDocument)=>void){
            throw new Exception("Not implement");
        }

        /**
         * 调用ajax方法
         * 
         * @param {*} opts 
         * @returns {*} 
         * @memberof IContext
         */
        ajax(opts:TransportOpts):IPromise{
            return transport(opts);
        }
        /**
         * 加载脚本
         * 
         * @param {string} url 
         * @returns {IPromise} 
         * @memberof IContext
         */
        loadScript(url:string,extras?:any):IPromise{
            if(!head){
                let heads= ctx.getElementsByTagName("head");
                head = <HTMLHeadElement>heads[0];
            }
            let result:IPromise = new Promise((resolve,reject)=>{
                let element:HTMLScriptElement = <HTMLScriptElement>ctx.createElement("script");
                element.type="text/script";element.src = url;
                element.onerror = (ev:ErrorEvent)=>reject(ev);
                if((<any>element).onreadystatechange!==undefined){
                    (<any>element).onreadystatechange=(e)=>{
                        if( (<any>element).readyState==='complete' || (<any>element).readyState===4){
                            let exports = window["exports"]; window["exports"]=undefined;
                            head.removeChild(element);
                            resolve(exports);
                        }
                    };
                }else {
                    element.onload =()=>{
                        let exports = window["exports"]; window["exports"]=undefined;
                        head.removeChild(element);
                        resolve(exports);
                    };
                }
                head.appendChild(element);
            });
            (result as any).extras = extras;
            return result;
        }
        /**
         * 加载是样表
         * 
         * @param {string} url 
         * @returns {IPromise} 
         * @memberof IContext
         */
        loadCss(url:string,extras?:any):IPromise{
            if(!head){
                let heads= ctx.getElementsByTagName("head");
                head = <HTMLHeadElement>heads[0];
            }
            let result:IPromise = new Promise((resolve,reject)=>{
                let element:HTMLLinkElement = <HTMLLinkElement>ctx.createElement("link");
                element.type="text/css";element.href = url;element.rel="stylesheet";
                element.onerror = (ev:ErrorEvent)=>reject(ev);
                if((<any>element).onreadystatechange!==undefined){
                    (<any>element).onreadystatechange=(e)=>{
                        if( (<any>element).readyState==='complete' || (<any>element).readyState===4){
                            let exports = window["exports"]; window["exports"]=undefined;
                            head.removeChild(element);
                            resolve();
                        }
                    };
                }else {
                    element.onload =()=>{
                        let exports = window["exports"]; window["exports"]=undefined;
                        head.removeChild(element);
                        resolve();
                    };
                }
                head.appendChild(element);
            });
            (result as any).extras = extras;
            return result;
        }
        /**
         * 加载文本内容
         * 
         * @param {string} url 
         * @returns {IPromise} 
         * @memberof IContext
         */
        loadContent(url:string,extras?:any):IPromise{
            return this.ajax({
                url:url,
                method:"GET"
            });
        }

        /**
         * 弹出一个警告框，icon为感叹号
         * 
         * @param {string} message 要显示的提示信息
         * @param {string} [title] 标题
         * @returns {IPromise} 
         * @memberof IContext
         */
        alert(message:string,title?:string):IPromise{
            return new Promise((resolve,reject)=>{
                window.alert(message);
                resolve(true);
            });
        }
        /**
         * 弹出一个确认框，icon为问号
         * 
         * @param {string} message 要显示的确认信息 
         * @param {string} [title] 
         * @returns {IPromise} 
         * @memberof IContext
         */
        confirm(message:string,title?:string):Promise{
            return new Promise((resolve,reject)=>{
                resolve(window.confirm(message));
            });
        }
        /**
         * 记录错误并扔出异常Error
         * 
         * @type {Function}
         * @memberof IContext
         */
        info:Function;
        /**
         * 对控制台error的抽象
         * 
         * @type {Function}
         * @memberof IContext
         */
        error:Function;
        /**
         * 对控制台警告的抽象
         * 
         * @type {Function}
         * @memberof IContext
         */
        warn:Function;
        /**
         * 创建Dom元素
         * 
         * @param {string} tagName 元素标签
         * @returns {HTMLElement} 创建的元素对象
         * @memberof Dom
         */
        createElement(tagName:string):HTMLElement{
            return document.createElement(tagName);
        }

        /**
         * 根据tagName获取文档
         * 
         * @param {string} tagName 
         * @param {string} context 
         * @returns {Array<HTMLElement>} 
         * @memberof Dom
         */
        getElementsByTagName(tagName:string,context?:HTMLElement):any{
            if(context) return context.getElementsByTagName(tagName);
            return document.getElementsByTagName(tagName);
        }
        /**
         * 给元素添加事件监听
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        attach(element:HTMLElement,evtname:string,listener:Function):void{
            if(element.addEventListener){
                this.attach = (element:HTMLElement,evtname:string,listener:any)=>{
                    element.addEventListener(evtname ,listener,false);
                }
            }else if((<any>element).attachEvent){
                this.attach = (element:HTMLElement,evtname:string,listener:any)=>{
                    (<any>element).attachEvent("on" + evtname ,listener);
                }
            }else {
                throw new Exception("Browser is too old to run Quic");
            }
            return this.attach(element,evtname,listener);
        }
        /**
         * 移除元素上的事件监听
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        detach(element:HTMLElement,evtname:string,listener:Function):void{
            if(element.removeEventListener){
                this.detach = (element:HTMLElement,evtname:string,listener:any)=>{
                    element.removeEventListener(evtname ,listener,false);
                }
            }else if((<any>element).detechEvent){
                this.detach = (element:HTMLElement,evtname:string,listener:any)=>{
                    (<any>element).detechEvent("on" + evtname ,listener);
                }
            }else {
                throw new Exception("Browser is too old to run Quic");
            }
            return this.detach(element,evtname,listener);
        }
        /**
         * 给元素添加css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要添加的css
         * @memberof Dom
         */
        addClass(element:HTMLElement,css:string):void{
            if(this.hasClass(element,css)) return;
            element.className += " " + css;
        }
         /**
         * 移除元素上的css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要移除的css
         * @memberof Dom
         */
        removeClass(element:HTMLElement,css:string):void{
            let existed = element.className;
            if(!existed) return;
            let at = existed.indexOf(css);
            if(at<0) return;
            let endAt = at + css.length;
            if(at===0){
                if(endAt<existed.length && !/\s/.test(existed[endAt]))return ;
            }else {
                if(!/\s/.test(existed[at-1])) return;
                at--;
                if(endAt<existed.length && !/\s/.test(existed[endAt]))return;
            }
            let newCss :string;
            if(at>0) newCss = existed.substring(0,at);
            if(endAt<existed.length){
                let c = existed.substring(endAt);
                if(newCss) newCss += c;
                else newCss = c;
            }
            element.className = newCss;
        }
        /**
         * 检查元素上是否具有某个css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要检测的css 
         * @returns {boolean} 是否存在
         * @memberof Dom
         */
        hasClass(element:HTMLElement,css:string):boolean{
            let existed = element.className;
            if(!existed) return false;
            let at = existed.indexOf(css);
            if(at<0) return false;
            let endAt = at + css.length;
            if(at===0){
                if(endAt===existed.length || /\s/.test(existed[endAt]))return true;
                return false;
            }else {
                if(!/\s/.test(existed[at-1])) return false;
                if(endAt=== existed.length || /\s/.test(existed[endAt]))return true;
                return false;
            }
        }
        style(element:any,name:string,value?:string):any{
            if(window.getComputedStyle){
                this.style = (element:HTMLElement,name:string,value?:string):any=>{
                    name = name.replace(/-[a-z]/g,(e)=>e[1].toUpperCase());
                    if(value===undefined){
                        return window.getComputedStyle(element,null)[name];
                    }else {
                        element.style[name] = value;
                    }
                }; 
            }else {
                this.style = (element:HTMLElement,name:string,value?:string):any=>{
                    name = name.replace(/-[a-z]/g,(e)=>e[1].toUpperCase());
                    if(value===undefined){
                        return (<any>element).currentStyle[name];
                    }else {
                        element.style[name] = value;
                    }
                }; 
            }
            this.style(element,name,value);
        }
        opacity(element:HTMLElement,value?:number):any{
            if(value===undefined){
                let op = parseFloat(this.style(element,"opacity"));
                if(op===op) return op;
                let filter = (<any>element).currentStyle["filter"];
                if(!filter) return 1;
                let reg = /alpha\s*\(\s*(\d+)\s*\)/g;
                reg.lastIndex = 0;
                let match = reg.exec(filter);
                if(match){
                    op = parseFloat(match[1])/100;
                }
                return op===op?op:1;
            }else {
                //filter: alpha(opacity=50);
                element.style.opacity=value.toString();
                element.style["filter"]="alpha(opacity=" +(value*100) + ")";
            }
        }
        
        show(element:HTMLElement,animation?:boolean){
            element.style.display=(<any>element).__quic_display || "";
        }
        hide(element:HTMLElement,animation?:boolean){
            let old = this.style(element,"display");
            if(old!=="none"){
                (<any>element).__quic_display = old;
            }
            element.style.display = "none";
        }
    }
    export const ctx:IContext = new BrowserContext();

    export const configs:{[index:string]:any}={};
    
}