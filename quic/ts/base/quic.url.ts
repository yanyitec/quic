/// <reference path="quic.promise.ts" />
/// <reference path="quic.context.ts" />
/// <reference path="quic.ajax.ts" />
/// <reference path="quic.access.ts" />
namespace Quic{
    ctx.bas_url = function(){
        let basUrl = "";
        let url = location.href;
        let at = url.indexOf("#");
        if(at>=0) url = url.substr(0,at);
        at = url.indexOf("?");
        if(at>=0) url = url.substr(0,at);
        let paths = url.split('/');
        let file = paths.pop();
        basUrl = paths.join("/");
        ctx.bas_url = ()=>basUrl;
        return basUrl;
    }
    export function makeUrl(url:string, data?:any, accessFactory?:AccessFactory):string{
        if(data){
            accessFactory ||(accessFactory = AccessFactory.default);
            //let      
        }
        throw "Not implement";
    }
}