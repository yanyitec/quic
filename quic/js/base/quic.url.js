/// <reference path="quic.promise.ts" />
/// <reference path="quic.context.ts" />
/// <reference path="quic.ajax.ts" />
/// <reference path="quic.access.ts" />
var Quic;
(function (Quic) {
    Quic.ctx.bas_url = function () {
        var basUrl = "";
        var url = location.href;
        var at = url.indexOf("#");
        if (at >= 0)
            url = url.substr(0, at);
        at = url.indexOf("?");
        if (at >= 0)
            url = url.substr(0, at);
        var paths = url.split('/');
        var file = paths.pop();
        basUrl = paths.join("/");
        Quic.ctx.bas_url = function () { return basUrl; };
        return basUrl;
    };
    function makeUrl(url, data, accessFactory) {
        if (data) {
            accessFactory || (accessFactory = Quic.AccessFactory.default);
            //let      
        }
        throw "Not implement";
    }
    Quic.makeUrl = makeUrl;
})(Quic || (Quic = {}));
