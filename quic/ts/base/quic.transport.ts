
/// <reference path="quic.promise.ts" />
namespace Quic{
    export interface TransportOpts{
        url:string;
        method?:string;
        type?:string;
        data?:any;
        dataType?:string;
        sync?:boolean;
        headers?:{[index:string]:string}
    }
    export class Transport extends Promise{
        xhr:XMLHttpRequest;
        opts:TransportOpts;
        constructor(opts:TransportOpts){
            let type:string = opts.type || "text";
            let dataType:string = opts.dataType;
            let method :string = opts.method?opts.method.toString().toUpperCase():"GET";
            let url:string = makeUrl(method,opts.url,opts.data);
            let data:string = makeData(method,type,opts.data);

            let xhr :XMLHttpRequest = new XMLHttpRequest();
            
            super((resolve:Function,reject:Function)=>{
                xhr.onreadystatechange = ()=>{
                    if(xhr.readyState===4){
                        handleResult(this,dataType,opts,resolve,reject);
                    }
                };
                xhr.open(method,url,opts.sync);
                let contentType :string = contentTypes[type];
                if(contentType) xhr.setRequestHeader("Content-Type", contentType);
                let headers :{[index:string]:string} = opts.headers;
                if(headers) {
                    for(let n in headers) xhr.setRequestHeader(n,headers[n]);
                }
                xhr.send(data);
    
            });
            this.opts = opts;
            this.xhr = xhr;
        }//end constructor
    }
    function makeUrl(method:string,url:string,data:any):string{
        if(method==="GET"){
            if(typeof data==="object"){
                url += url.indexOf("?")>=0?"&":"?";
                for(let n in data){
                    url += encodeURIComponent(n);
                    url += "=";
                    let v :string = data[n];
                    url += encodeURIComponent(v===undefined||v===null?"":v.toString());
                    url += "&";
                }
            }
            data = undefined;
        }
        return url;
    }
    function makeData(method:string,type:string,data:string){
        if(method==="GET")return;
        if(typeof data==="object"){
            if(type==="json"){
                data = JSON.stringify(data);
            }else if(type==="xml"){
                throw new Error("Not implement");
            }else{
                let encoded:string = "";
                for(let n in data){
                    if(encoded)encoded += "&";
                    encoded += encodeURIComponent(n);
                    encoded += "=";
                    let v :string = data[n];
                    encoded += encodeURIComponent(v===undefined||v===null?"":v.toString());
                }
                data = encoded;
            }

        }
        return data;
    }
    function handleResult(transport:Transport,dataType:string,opts:any,resolve:Function,reject:Function){
        let xhr:XMLHttpRequest = transport.xhr;
        if(dataType==="xml"){
            this.resolve(xhr.responseXML);return;
        }else if(dataType==="json"){
            let json :any ;
            let responseText = xhr.responseText;
            try{
                json = JSON.parse(responseText);
            }catch(ex){
                ctx.error("Ajax parse JSON error",responseText,opts);
                reject(ex);
                return;
            }
            resolve(json);return;                  
        }else {
            this.resolve(xhr.responseText);return;
        }
    }
    let contentTypes = (Transport as any).contentTypes ={
        "json":"application/json",
        "xml":"application/xml",
        "html":"application/html",
        "text":"application/text"
    };
    export function ajax(opts:TransportOpts):Transport{ return new Transport(opts);}
    export function transport(opts:TransportOpts):Transport{return new Transport(opts);}
}
exports.Transport = Quic.Transport;
exports.transport = Quic.transport;
exports.ajax = Quic.ajax;