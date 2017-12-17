/// <reference path="quic.promise.d.ts" />
declare namespace Quic {
    interface TransportOpts {
        url: string;
        method?: string;
        type?: string;
        data?: any;
        dataType?: string;
        sync?: boolean;
        headers?: {
            [index: string]: string;
        };
    }
    class Transport extends Promise {
        xhr: XMLHttpRequest;
        opts: TransportOpts;
        constructor(opts: TransportOpts);
    }
    function ajax(opts: TransportOpts): Transport;
    function transport(opts: TransportOpts): Transport;
}
