
namespace Quic{
    export let opts={
        "validation-message-prefix":"valid-"
    };
    export function nextGNo():number{
        if(id_seed++>2100000000) id_seed= -2100000000;
        return id_seed;
    }
    let id_seed:number = 10000;

    //export let arrRegx:RegExp =/(?:\[\d+\])+$/g;
   

    export let trim :(o:any)=>string=(o:any):string=>o===null||o===undefined?"":o.toString().replace(/^(?:\s+)|(?:\s+$)/,"");
    
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

     
    export function str_replace(text:any,data?:any,accessorFactory?:AccessFactory){
        if(text===null || text===undefined) text="";
        else text = text.toString();
        //if(!data){ return text;}
        let regx = /\{([a-zA-Z\$_0-9\[\].]+)\}/g;
        accessorFactory || (accessorFactory=AccessFactory.default);
        return text.replace(regx,function(m){
            let accessor :(data:{[index:string]:any},value?:any)=>any;
            let expr :string = m[1];
            try{
                accessor = accessorFactory.getOrCreate(expr);
            }catch(ex){
                ctx.warn("Invalid datapath expression:" + expr);
                return "{INVALID:"+expr+"}";
            }
            return data?accessor(data):"";
        });
    }

    
}