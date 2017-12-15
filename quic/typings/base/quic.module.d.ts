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
    function module(name: string): Module;
    function define(modname: string | Array<string>, depnames: Array<string> | Function, definer?: Function): IPromise;
    let exports: any;
}
