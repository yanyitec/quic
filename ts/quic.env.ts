/// <reference path="quic.ts" />
namespace Quic{
    export interface Env{
        
        alert(msg:string);
        confirm(msg:string);
        error:Function;
        warn:Function;
    }
    export let env:Env;
    
}