/// <reference path="quic.promise.d.ts" />
declare namespace Quic {
    class HttpRequest extends Promise {
        xhr: XMLHttpRequest;
        opts: {};
        constructor(opts: any);
    }
    function ajax(opts: any): HttpRequest;
}
