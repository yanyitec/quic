
/// <reference path="quic.promise.ts" />
namespace Quic{
    export class HttpRequest extends Promise{
        xhr:XMLHttpRequest;
        opts:{};
        constructor(opts){
            super();
            this.opts = opts;
            let xhr :XMLHttpRequest = this.xhr = new XMLHttpRequest();
            let url:string;
            xhr.onreadystatechange = ()=>{
                if(xhr.readyState===4){
                    let dataType:string = opts.dataType||"";
                    if(dataType==="xml"){
                        this.resolve(xhr.responseXML);return;
                    }else if(dataType==="json"){
                        let json :any ;
                        let responseText = xhr.responseText;
                        try{
                            json = JSON.parse(responseText);
                        }catch(ex){
                            ctx.error("Ajax parse JSON error",responseText,url,opts);
                            this.reject(ex);
                            return;
                        }
                        this.resolve(json);return;                  
                    }
                    this.resolve(xhr.responseText);return;
                }
            };
            let data:any = opts.data;
            url = opts.url;
            let method :string = opts.method?opts.method.toString().toUpperCase():"GET";
            let type :string = opts.type;
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
            }else{
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
            }//end if
            let contentType :string = contentTypes[type];
            if(contentType) xhr.setRequestHeader("Content-Type", contentType);
            let headers :{[index:string]:string} = opts.headers;
            if(headers) {
                for(let n in headers) xhr.setRequestHeader(n,headers[n]);
            }
            xhr.open(method,url,opts.sync);
            xhr.send(data);

        }//end constructor
    }
    let contentTypes = (HttpRequest as any).contentTypes ={
        "json":"application/json",
        "xml":"application/xml",
        "html":"application/html",
        "text":"application/text"
    };
    export function ajax(opts):HttpRequest{ return new HttpRequest(opts);}

}