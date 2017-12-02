namespace Quic{
    export let opts={
        "validation-message-prefix":"valid-"
    };
    export function nextGNo():number{
        if(id_seed++>2100000000) id_seed= -2100000000;
        return id_seed;
    }
    let id_seed:number = 10000;

    export let arrRegx:RegExp =/(?:\[\d+\])+$/g;
    export let trimRegx:RegExp = /(^\s+)|(\s+$)/g;
    export let urlRegx :RegExp = /^\s*(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/g;
    export let emailRegx :RegExp = /^\s*[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?\s*$/g;
    export let intRegx :RegExp = /(^[+\-]?\d+$)|(^[+\-]?\d{1,3}(,\d{3})?$)/;
    export let decimalRegx:RegExp= /^((?:[+\-]?\d+)|(?:[+\-]?\d{1,3}(?:\d{3})?))(.\d+)?$/;

    export let trim :(o:any)=>string=(o:any):string=>o===null||o===undefined?"":o.toString().replace(trimRegx,"");
    
    let toString = Object.prototype.toString;
    export let isArray:(o:any)=>boolean=(o:any):boolean=>toString.call(o)==="[object Array]";
    export function isElement(node:any){
        return node.nodeType!==undefined && node.getAttribute && node.appendChild;
    }

    export function getExactType(o:any):string{
        if(o===null)return "null";
        if(o instanceof RegExp) return "regex";
        let t:string = typeof o;
        if(t==="object"){
            if(toString.call(o)==="[object Array]") return "array";
            if(o.nodeType!==undefined && o.appendChild && o.getAttribute) return "element";
        }
        return t;
    }
    
    
    export function extend(dest:any,src:any,arg2?:any,arg3?:any,arg4?:any,arg5?:any,arg6?:any,arg7?:any,arg8?:any):any{
         if(!src) return dest;
         if(!dest) dest=isArray(src)?[]:{};
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
     export function array_index(arr:Array<any>,value:any):number{
         for(let i=0,j=arr.length;i<j;i++){
             if(arr[i]===value) return i;
         }
         return -1;
     }

     export class AccessFactory implements IAccessFactory{
        caches:{[dataPath:string]:(data:{[index:string]:any},value?:any)=>any};
        constructor(){
            this.caches = {};
            this.create = AccessFactory.create;
        }
        create:(dataPath:string)=>(data:{[index:string]:any},value?:any)=>any;
        cached(dataPath:string):(data:{[index:string]:any},value?:any)=>any{
            let accessor:(data:{[index:string]:any},value?:any)=>any =  this.caches[dataPath];
            if(!accessor){
                accessor = this.caches[dataPath] = AccessFactory.create(dataPath);
            }
            return accessor;
        }
        static create : (dataPath:string)=>(data:{[index:string]:any},value?:any)=>any = (dataPath:string):(data:{[index:string]:any},value?:any)=>any=>{
            if(dataPath=="$"){
                return function(data:{[index:string]:any},value?:any):any{
                    if(value===undefined) return data;
                    throw new Error("setting cannot apply for datapath[$]");
                };
            }
            let paths = dataPath.split(".");
            
            let last_propname = paths.shift().replace(trimRegx,"");
            if(!last_propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            let codes = {
                path:"data",
                getter_code:"",
                setter_code:""
            };
            for(let i =0,j=paths.length;i<j;i++){
                let propname = paths[i].replace(trimRegx,"");
                buildPropCodes(propname,dataPath,codes);
            }
            buildPropCodes(last_propname,dataPath,codes,true);
            let code = "if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code +="var at;\nif(value===undefined){\n" +codes.getter_code + "\treturn data;\n}else{\n" + codes.setter_code + "\n}\n";
            return new Function("data",code) as (data:{[index:string]:any},value?:any)=>any;
            
        };
        static cached(dataPath:string):(data:{[index:string]:any},value?:any)=>any{
            return AccessFactory.instance.cached(dataPath);
        }
        static instance:AccessFactory = new AccessFactory();
    }
    function buildPropCodes(propname:string,dataPath,codes:any,isLast?:boolean){
        if(!propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        let match = arrRegx.exec(propname);
        let nextObjValue="{}";
        let sub=undefined;
        if(match){
            sub = match.toString();
            propname = propname.substring(0,propname.length-sub.length);
            nextObjValue="[]";
        }
        codes.path +="." + propname;
        codes.getter_code += `\tif(!data.${propname})return undefined;else data=data.${propname};\n`;
        codes.setter_code += `\tif(!data)data.${propname}=${nextObjValue};\n`;
        if(sub) {
            let subs = sub.substr(1,sub.length-2).split(/\s*\]\s*\[\s*/g);
            for(let m=0,n=subs.length-1;m<=n;m++){
                let indexAt = subs[m];
                if(indexAt==="first"){
                    codes.getter_code += `\tif(!data[0])return undefined;else data = data[0];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) codes.setter_code += `\tif(!data[0]) data[0] = value;\n`;
                        else codes.setter_code += `\tif(!data[0]) data = data[0]={};else data=data[0];\n`;
                    }else{
                        codes.setter_code += `\tif(!data[0]) data[0]=[]"\n`;
                    }
                }else if(indexAt==="last"){
                    codes.getter_code += `\tat = data.length?data.length-1:0; if(!data[at])return undefined;else data = data[at];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) codes.setter_code += `\tat = data.length?data.length-1:0; if(!data[at]) data[at]=value";\n`;
                        else codes.setter_code += `\tat = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n`;
                    }else{
                        codes.setter_code += `\tat = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n`;
                    }
                }else {
                    if(!/\d+/.test(indexAt)) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += `\tif(!data[${indexAt}])return undefined;else data = data[${indexAt}];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) codes.setter_code += `\tif(!data[${indexAt}]) data[${indexAt}]=value";\n`;
                        else codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]={};else data=data[${indexAt}];\n`;
                    }else{
                        codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]=[];else data=data[${indexAt}];\n`;
                    }
                }       
            }
            
        }
    }
    export function str_replace(text:any,data?:any,accessorFactory?:AccessFactory){
        if(text===null || text===undefined) text="";
        else text = text.toString();
        //if(!data){ return text;}
        let regx = /\{([a-zA-Z\$_0-9\[\].]+)\}/g;
        accessorFactory || (accessorFactory=AccessFactory.instance);
        return text.replace(regx,function(m){
            let accessor :(data:{[index:string]:any},value?:any)=>any;
            let expr :string = m[1];
            try{
                accessor = accessorFactory.cached(expr);
            }catch(ex){
                Quic.env.warn("Invalid datapath expression:" + expr);
                return "{INVALID:"+expr+"}";
            }
            return data?accessor(data):"";
        });
    }
}