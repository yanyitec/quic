"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var Quic;
(function (Quic) {
    var serv_config = require(__dirname + "/configs/server.config.js").serv_config;
    let mines = require(__dirname + "/mines.js").mines;
    console.log(JSON.stringify(serv_config));
    console.log("wwwroot:" + serv_config.root_dir);
    console.log("controllers:" + serv_config.controller_path);
    function tryAgent(urlpath) {
        return false;
    }
    function tryStaticFile(request, response, urlpath) {
        if (request.method !== "GET")
            return false;
        var ext = path.extname(urlpath);
        if (!ext)
            return false;
        ext = ext.slice(1);
        var realPath = path.join(serv_config.root_dir, urlpath);
        console.log(realPath);
        fs.exists(realPath, function (exists) {
            if (!exists) {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.write("This request URL " + urlpath + " was not found on this server.");
                response.end();
            }
            else {
                fs.readFile(realPath, "binary", function (err, file) {
                    if (err) {
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.end(err);
                    }
                    else {
                        var contentType =mines[ext]|| "text/plain";
                        response.writeHead(200, {
                            'Content-Type': contentType
                        });
                        response.write(file, "binary");
                        response.end();
                    }
                });
            }
        });
        return true;
    }
    var server = http.createServer(function (request, response) {
        var urlpath = url.parse(request.url).pathname;
        //已经转代理
        if (tryAgent(urlpath))
            return;
        if (tryStaticFile(request, response, urlpath))
            return;
    });
    server.listen(serv_config.port);
    console.log("Server runing at port: " + serv_config.port + ".");
})(Quic || (Quic = {}));
