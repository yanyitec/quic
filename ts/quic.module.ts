/// <reference path="quic.ts" />
/// <reference path="quic.promise.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
namespace Quic{
    
    export class Quic implements IQuic{
        /**
         * 模块名
         * 
         * @type {string}
         * @memberof IQuic
         */
        name:string;
        /**
         * 字段集合
         * 
         * @type {IFieldset}
         * @memberof IQuic
         */
        fieldset:IFieldset;

        /**
         * 数据访问器工厂
         * 
         * @type {IAccessFactory}
         * @memberof IQuic
         */
        accessFactory:IAccessFactory;

        renderers:{[index:string]:IRenderer};
        
        /**
         * 事件集合 viewname/fieldname/evtname
         * 从controller中分析出来
         * @type {[viewname:string]:any}
         * @memberof IQuic
         */
        events:{[viewname:string]:any};
        
        /**
         * 控制器
         * 
         * @type {(IController|Function)}
         * @memberof IQuic
         */
        controller:IController|Function;

        langs:{[key:string]:string};

        /**
         * 需要额外销毁的资源
         * 
         * @type {Array<IDisposable>}
         * @memberof IQuic
         */
        resources:Array<IDisposable>;

        _readies:Array<(module:IQuic)=>void>;
        constructor(){
            this._readies=[];
        }
        _T(key:string,mustReturn?:boolean):string{
            let text;
            if(this.langs) text = this.langs[key];
            if(text===undefined) text = langs[key];
            if(text===undefined && mustReturn===true) key;
            return text;
        }
        ready(handler:(module:Quic)=>void){
            this._readies.push(handler);
        }
        init(opts:QuicOpts){
            for(let i =0,j= this._readies.length;i<j;i++){
                this._readies[i](this);
            }
            this._readies=undefined;
            this.ready = (handler:(module:Quic)=>void):void=>{
                handler(this);
            }
        }
        /**
         * 获取事件监听器
         * 
         * @param {string} evtName 事件名
         * @param {string} [viewname] 视图名，默认为viewset的
         * @returns {*} 
         * @memberof IQuic
         */
        getEventListener(evtName:string,viewname?:string):any{

        }
        /**
         * 根据permission获取呈现器
         * 
         * @param {string} viewType 
         * @returns {IRenderer} 
         * @memberof IQuic
         */
        findRenderer(viewType:string):IRenderer{
            let result :IRenderer;
            return this.renderers[viewType] || renderers[viewType];
        }
    }
    export let cached_modules :{[name:string]:Quic}={};
    let loadQuic=(name:string ,comlete:(module:Quic)=>void)=>{
        let module = cached_modules[name];
        if(!module) module = cached_modules[name]=new Quic();
        module.ready(comlete);
        return module;
    }
}