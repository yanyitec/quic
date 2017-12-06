declare var $$TEST;
declare var require;

namespace Quic{
    namespace Tests{
        function promise_resolve(){
            $$TEST.log("promise_resolve->test");
            let resolveValue:any,invocation:any;
            let resolveErr:any,resolveAt:any;
            let promise :IPromise = new Quic.Promise((resolve,reject)=>{
                resolve(12,13);
            });
            promise.done(function(value,inv){
                resolveValue = value;
                invocation = inv;
            }).fail((e,at)=>{
                resolveErr = e;resolveAt = at;
            });
            new $$TEST(resolveValue).isUndefined();
            new $$TEST(invocation).isUndefined();
            new $$TEST(resolveErr).isUndefined();
            new $$TEST(resolveAt).isUndefined();
            setTimeout(()=>{
                new $$TEST(resolveValue).isSame(12);
                new $$TEST(invocation).isSame(13);
                new $$TEST(resolveErr).isUndefined();
                new $$TEST(resolveAt).isUndefined();
                let secondv:any,secondi;
                promise.done((s,i)=>{
                    secondv=s;secondi=i;
                });
                new $$TEST(secondv).isSame(12);
                new $$TEST(secondi).isSame(13);
                $$TEST.log("promise_resolve->success");
                
            },200);
        }
        function promise_reject(){
            $$TEST.log("promise_reject->test");
            let resolveValue:any,invocation:any;
            let resolveErr:any,resolveAt:any;
            let promise :IPromise = new Quic.Promise((resolve,reject)=>{
                reject("dd","rr");
            });
            promise.done(function(value,inv){
                resolveValue = value;
                invocation = inv;
            }).fail((e,at)=>{
                resolveErr = e;resolveAt = at;
            });
            new $$TEST(resolveValue).isUndefined();
            new $$TEST(invocation).isUndefined();
            new $$TEST(resolveErr).isUndefined();
            new $$TEST(resolveAt).isUndefined();
            setTimeout(()=>{
                new $$TEST(resolveErr).isSame("dd");
                new $$TEST(resolveAt).isSame("rr");
                new $$TEST(resolveValue).isUndefined();
                new $$TEST(invocation).isUndefined();
                let secondv:any,secondi;
                promise.fail((s,i)=>{
                    secondv=s;secondi=i;
                });
                new $$TEST(secondv).isSame("dd");
                new $$TEST(secondi).isSame("rr");

                $$TEST.log("promise_reject->success");
                
            },200);
        }

        

        if(require){
            Quic.Promise = require("../base/quic.promise").Promise;
            $$TEST = require("../base/quic.test").$$TEST;
        } 
        promise_resolve();
        promise_reject();
    }
}