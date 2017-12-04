/// <reference path="quic.d.ts" />
/// <reference path="quic.promise.d.ts" />
/// <reference path="quic.env.d.ts" />
/// <reference path="quic.dom.d.ts" />
declare namespace Quic {
    class Module extends Promise {
        name: string;
        deps: Array<Module>;
        value: any;
        isdefine: boolean;
        error: any;
        __last_heart_beat_time__: Date;
        constructor(name: string);
        heart_beat(): this;
    }
    let baseUrl: string;
    function makeUrl(url: any, data?: any): string;
    function module(name: string): Module;
    function define(modname: string | Array<string>, depnames: Array<string> | Function, definer?: Function): IPromise;
    let exports: any;
}
