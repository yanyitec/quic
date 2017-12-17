/// <reference path="quic.promise.d.ts" />
/// <reference path="quic.context.d.ts" />
/// <reference path="quic.ajax.d.ts" />
declare namespace Quic {
    function makeUrl(url: string, data?: any, accessFactory?: AccessFactory): string;
}
