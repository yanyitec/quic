var PORT = 3000;

var http = require('http');
var url=require('url');
var fs=require('fs');
var mine=require('./dev/mine').types;
var BufferHelper=require('./dev/buffer');
var path=require('path');

var server = http.createServer(function (request, response) {
    if(request.method==="POST") post(request,response);
    else  get(request,response);
});
function get(request, response) {
    var pathname = url.parse(request.url).pathname;
    var realPath = path.join("./", pathname);
    //console.log(realPath);
    var ext = path.extname(realPath);
    ext = ext ? ext.slice(1) : 'unknown';
    fs.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            //response.setEncoding('utf8');  
            response.write("This request URL " + pathname + " was not found on this server.");
            response.end();
        } else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    console.log(err);
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
    });
}

function post(request,response){
    var pathname = url.parse(request.url).pathname;
    if(!checkDir(pathname)) return;
    var realPath = path.join("./", pathname);
    var bufferHelper = new BufferHelper();
    
    request.on('data', function (chunk) { 
        console.log("ondata",chunk); 
        bufferHelper.concat(chunk);
    });  
    request.on("end",function(data){
        console.log("onend");
        var json = bufferHelper.toBuffer().toString();
        console.log("post recv",json);
        mkdirs(path.dirname(realPath),undefined,function(dirname){
            fs.writeFile(realPath,json,{encoding:"utf8"},function(err,file){
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
        
        //res.end('{"status":0,"message":"success"}');        
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
server.listen(PORT);

console.log("Server runing at port: " + PORT + ".");