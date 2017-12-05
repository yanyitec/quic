
import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from "path";
import { BufferContactor } from './buffer';
import { Url } from 'url';

namespace Quic{
    export interface IServerConfig{
        port:number;
        root_dir:string;
        controller_dir:string;
    }
    export interface IRequest{
        queries:{[index:string]:string};
        posts:{[index:string]:string};
        contentType:string;
        method:string;
        contentBody:any;
    }
    export interface IController{
        response:http.ServerResponse
        root_dir:string;
        controller_dir:string;
    }
    var httpProxy = require('http-proxy');
    let serv_config:IServerConfig = require(__dirname + "/configs/server.config.js").serv_config as IServerConfig;
    let bufferConcator = require(__dirname + "/buffer.js").BufferContactor;
    console.log(JSON.stringify(serv_config));
    console.log(`wwwroot:${serv_config.root_dir}`);
    console.log(`controllers:${serv_config.controller_dir}`);

    function startProxy(cfg:IServerConfig){
        let proxy = httpProxy.createProxyServer({
            target: 'http://192.168.10.38:8180/',   //接口地址
            // 下面的设置用于https
            // ssl: {
            //     key: fs.readFileSync('server_decrypt.key', 'utf8'),
            //     cert: fs.readFileSync('server.crt', 'utf8')
            // },
            // secure: false
        });
        proxy.on('error', function (err, request, response) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            console.error(err)
            response.end('proxy run to a error:' + err)
        });
        return proxy;
    }
    
    let proxy = startProxy(serv_config);
    

    function tryAgent(request:http.ServerRequest,response:http.ServerResponse,urlpath:string):boolean{
        if(/\/api\/.*$/.test(urlpath)){
            proxy.web(request, response);
            return;
        }
        return false;
    }

    function tryStaticFile(request:http.ServerRequest,response:http.ServerResponse,urlpath:string):boolean{
        if(request.method!=="GET")return false;
        let ext:string = path.extname(urlpath);
        if(!ext)return false;
        ext =  ext.slice(1);
        let realPath:string = path.join(serv_config.root_dir, urlpath);
        console.log(realPath);
        fs.exists(realPath, function (exists) {
            if (!exists) {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
    
                response.write("This request URL " + urlpath + " was not found on this server.");
                response.end();
            } else {
                fs.readFile(realPath, "binary", function (err, file) {
                    if (err) {
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.end(err);
                    } else {
                        var contentType = "text/plain";
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

    function post(request,response,uri:url.Url){
            var pathname = uri.pathname;
            if(!checkDir(pathname,response)) return;
            var realPath = path.join("./", pathname);
            var bufferHelper = new BufferContactor();
            request.on('data', function (chunk) { 
                bufferHelper.concat(chunk);
            });  
            request.on("end",function(data){
                var json = bufferHelper.toBuffer().toString();
                console.log("post recv",json);
                mkdirs(path.dirname(realPath),undefined,function(dirname){
                    fs.writeFile(realPath,json,(err)=>{
                        if (err) {
                            console.log(err);
                            response.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            response.end('{"status":1,"message":"'+err+'"}');
                        }
                        response.end('{"status":0,"message":"success"}');     
                    });
                });
            });
        }
        
        var checkDir = function(path,response){
            var allowed = /^\/definations\//g;
            if(!allowed.test(path)){
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.end('{"status":1,"message":"path:'+path+' is not allowed to write."}');
                return false;
            }
            return true;
        
        }
        
        var mkdirs = function(dirpath, mode, callback) {
            fs.exists(dirpath, function(exists) {
                if(exists) {
                    callback(dirpath);
                } else {
                    //尝试创建父目录，然后再创建当前目录
                    var dir = path.dirname(dirpath);       
                    console.log("try to create path:" + dir);        
                    mkdirs(dir, mode, function(){       
                        console.log("try to create path:" + dirpath);       
                            fs.mkdir(dirpath, mode, callback);       
                    });       
            }       
        });      
    };  
    let server:http.Server = http.createServer(function (request, response) {
        let uri = url.parse(request.url);
        let urlpath = uri.pathname;
        //已经转代理
        if(tryAgent(request,response,urlpath))return;
        if(tryStaticFile(request , response,urlpath)) return;
        post(request,response,uri);
    });
    server.listen(serv_config.port);
    console.log(`Server runing at port: ${serv_config.port}.`);
}