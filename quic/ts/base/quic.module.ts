
namespace Quic{
    let head:HTMLHeadElement;
    
    let loadScript = ctx.loadScript =(url:string,extras?:any):IPromise=>{
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

    let loadCss = ctx.loadCss =(url:string,extras?:any):IPromise=>{
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

    ctx.loadContent =(url:string,extras?:any):IPromise=>ajax({
        url:url,
        method:"get"
    });

    

    export class Module extends Promise {
        name:string;
        deps:Array<Module>;
        value:any;
        isdefine:boolean;
        error:any;
        __last_heart_beat_time__:Date;
        constructor(name:string){
            super();
            this.name = name;
        }
        
        heart_beat(){
            this.__last_heart_beat_time__= new Date();
            return this;
        }
    }
    let cached_modules :{[index:string]:Module}={};
    export let baseUrl:string;
    export function makeUrl(url,data?:any):string{
        return url;
    }
    function require(...modnames):IPromise{
        let depnames:Array<string>;
        let invokeByApply:boolean = true;
        let arg0 = arguments[0];
        if(typeof arg0==='object' && Object.prototype.toString.call(this,arg0)==="{object,Array}"){
            depnames = depnames;
            invokeByApply = arguments[1];
        }else{
            depnames=[];
            for(let i =0,j=arguments.length;i<j;i++) depnames.push(arguments[i]);
        }
        return new Promise((resolve,reject)=>{
            let deps:Array<Module>=[];
            let count = depnames.length;
            let task_count = count;
            let hasError = false;
            for(let i = 0;i<count;i++){
                module(depnames[i]).then((value)=>{
                    if(hasError)return;
                    deps[i] = value;
                    if(--task_count==0) resolve(deps,invokeByApply);
                },(err,at)=>{
                    hasError = true;
                    reject(err,at);
                });
            }
        });
        
    }
    export function module(name:string):Module{
        let module = cached_modules[name];
        if(!module){
            module = new Module(name);cached_modules[name] = module;
            let url :string = makeUrl(name);

            let res = loadScript(url).then((scriptExports:any)=>{
                
                if(scriptExports.__isdefine__){
                    (scriptExports as Promise).then((defineResults)=>{
                        module.resolve(defineResults.value);
                        module.deps = defineResults.deps;
                        module.isdefine = true;
                    });
                }else module.value = scriptExports;
                module.resolve(module.value);
            },(err,at)=>{
                module.error = err;
                module.reject(err,at);
            });
            cached_modules[name] = module;
        }
        module.heart_beat();
        return module;
    }


    export function define(modname:string|Array<string>,depnames:Array<string>|Function,definer?:Function):IPromise{
        if(typeof modname!=="string"){
            definer= <Function>depnames; depnames=<Array<string>>modname;
        }
        let result =  new Promise((resolve,reject)=>{
            require(depnames,true).then((deps)=>{
                let module_value:any;
                try{
                    module_value = definer.apply(result,deps);
                }catch(ex){
                    result.reject(ex);return;
                }
                if(module_value!==result) result.resolve({
                    value:module_value,
                    isdefine:true,
                    deps:deps
                });
            },(err,at)=>{
                result.reject(err,at);
            });
        });
        (result as any).__isdefine__=true;
        exports = result;
        return result;
    }

    export let exports:any;
}