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
    var Transport = /** @class */ (function (_super) {
        __extends(Transport, _super);
        function Transport(opts) {
            var _this = this;
            var type = opts.type || "text";
            var dataType = opts.dataType;
            var method = opts.method ? opts.method.toString().toUpperCase() : "GET";
            var url = makeUrl(method, opts.url, opts.data);
            var data = makeData(method, type, opts.data);
            var xhr = new XMLHttpRequest();
            _this = _super.call(this, function (resolve, reject) {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        handleResult(_this, dataType, opts, resolve, reject);
                    }
                };
                xhr.open(method, url, opts.sync);
                var contentType = contentTypes[type];
                if (contentType)
                    xhr.setRequestHeader("Content-Type", contentType);
                var headers = opts.headers;
                if (headers) {
                    for (var n in headers)
                        xhr.setRequestHeader(n, headers[n]);
                }
                xhr.send(data);
            }) || this;
            _this.opts = opts;
            _this.xhr = xhr;
            return _this;
        } //end constructor
        return Transport;
    }(Quic.Promise));
    Quic.Transport = Transport;
    function makeUrl(method, url, data) {
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
        return url;
    }
    function makeData(method, type, data) {
        if (method === "GET")
            return;
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
        return data;
    }
    function handleResult(transport, dataType, opts, resolve, reject) {
        var xhr = transport.xhr;
        if (dataType === "xml") {
            this.resolve(xhr.responseXML);
            return;
        }
        else if (dataType === "json") {
            var json = void 0;
            var responseText = xhr.responseText;
            try {
                json = JSON.parse(responseText);
            }
            catch (ex) {
                Quic.ctx.error("Ajax parse JSON error", responseText, opts);
                reject(ex);
                return;
            }
            resolve(json);
            return;
        }
        else {
            this.resolve(xhr.responseText);
            return;
        }
    }
    var contentTypes = Transport.contentTypes = {
        "json": "application/json",
        "xml": "application/xml",
        "html": "application/html",
        "text": "application/text"
    };
    function ajax(opts) { return new Transport(opts); }
    Quic.ajax = ajax;
    function transport(opts) { return new Transport(opts); }
    Quic.transport = transport;
})(Quic || (Quic = {}));
exports.Transport = Quic.Transport;
exports.transport = Quic.transport;
exports.ajax = Quic.ajax;
