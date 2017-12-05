var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="quic.promise.ts" />
var Quic;
(function (Quic) {
    var HttpRequest = /** @class */ (function (_super) {
        __extends(HttpRequest, _super);
        function HttpRequest(opts) {
            var _this = _super.call(this) || this;
            _this.opts = opts;
            var xhr = _this.xhr = new XMLHttpRequest();
            var url;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    var dataType = opts.dataType || "";
                    if (dataType === "xml") {
                        _this.resolve(xhr.responseXML);
                        return;
                    }
                    else if (dataType === "json") {
                        var json = void 0;
                        var responseText = xhr.responseText;
                        try {
                            json = JSON.parse(responseText);
                        }
                        catch (ex) {
                            Quic.ctx.error("Ajax parse JSON error", responseText, url, opts);
                            _this.reject(ex);
                            return;
                        }
                        _this.resolve(json);
                        return;
                    }
                    _this.resolve(xhr.responseText);
                    return;
                }
            };
            var data = opts.data;
            url = opts.url;
            var method = opts.method ? opts.method.toString().toUpperCase() : "GET";
            var type = opts.type;
            if (method === "GET") {
                if (typeof data === "object") {
                    url += url.indexOf("?") >= 0 ? "&" : "?";
                    for (var n in data) {
                        url += encodeURIComponent(n);
                        url += "=";
                        var v = data[n];
                        url += encodeURIComponent(v === undefined || v === null ? "" : v.toString());
                        url += "&";
                    }
                }
                data = undefined;
            }
            else {
                if (typeof data === "object") {
                    if (type === "json") {
                        data = JSON.stringify(data);
                    }
                    else if (type === "xml") {
                        throw new Error("Not implement");
                    }
                    else {
                        var encoded = "";
                        for (var n in data) {
                            if (encoded)
                                encoded += "&";
                            encoded += encodeURIComponent(n);
                            encoded += "=";
                            var v = data[n];
                            encoded += encodeURIComponent(v === undefined || v === null ? "" : v.toString());
                        }
                        data = encoded;
                    }
                }
            } //end if
            var contentType = contentTypes[type];
            if (contentType)
                xhr.setRequestHeader("Content-Type", contentType);
            var headers = opts.headers;
            if (headers) {
                for (var n in headers)
                    xhr.setRequestHeader(n, headers[n]);
            }
            xhr.open(method, url, opts.sync);
            xhr.send(data);
            return _this;
        } //end constructor
        return HttpRequest;
    }(Quic.Promise));
    Quic.HttpRequest = HttpRequest;
    var contentTypes = HttpRequest.contentTypes = {
        "json": "application/json",
        "xml": "application/xml",
        "html": "application/html",
        "text": "application/text"
    };
    function ajax(opts) { return new HttpRequest(opts); }
    Quic.ajax = ajax;
})(Quic || (Quic = {}));
