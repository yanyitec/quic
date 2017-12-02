/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
namespace Quic{
    
    export class Module implements IModule{
        /**
         * 模块名
         * 
         * @type {string}
         * @memberof IModule
         */
        name:string;
        /**
         * 字段集合
         * 
         * @type {IFieldset}
         * @memberof IModule
         */
        fieldset:IFieldset;

        /**
         * 数据访问器工厂
         * 
         * @type {IAccessFactory}
         * @memberof IModule
         */
        accessFactory:IAccessFactory;

        renderers:{[index:string]:IRenderer};
        
        /**
         * 事件集合 viewname/fieldname/evtname
         * 从controller中分析出来
         * @type {[viewname:string]:any}
         * @memberof IModule
         */
        events:{[viewname:string]:any};
        
        /**
         * 控制器
         * 
         * @type {(IController|Function)}
         * @memberof IModule
         */
        controller:IController|Function;

        /**
         * 需要额外销毁的资源
         * 
         * @type {Array<IDisposable>}
         * @memberof IModule
         */
        resources:Array<IDisposable>;

        _readies:Array<(module:Module)=>void>;
        constructor(){
            this._readies=[];
        }
        ready(handler:(module:Module)=>void){
            this._readies.push(handler);
        }
        init(opts:ModuleOpts){
            for(let i =0,j= this._readies.length;i<j;i++){
                this._readies[i](this);
            }
            this._readies=undefined;
            this.ready = (handler:(module:Module)=>void):void=>{
                handler(this);
            }
        }
        /**
         * 获取事件监听器
         * 
         * @param {string} evtName 事件名
         * @param {string} [viewname] 视图名，默认为viewset的
         * @returns {*} 
         * @memberof IModule
         */
        getEventListener(evtName:string,viewname?:string):any{

        }
        /**
         * 根据permission获取呈现器
         * 
         * @param {string} viewType 
         * @returns {IRenderer} 
         * @memberof IModule
         */
        findRenderer(viewType:string):IRenderer{
            let result :IRenderer;
            return this.renderers[viewType] || renderers[viewType];
        }
    }
    export let cached_modules :{[name:string]:Module}={};
    let loadModule=(name:string ,comlete:(module:Module)=>void)=>{
        let module = cached_modules[name];
        if(!module) module = cached_modules[name]=new Module();
        module.ready(comlete);
        return module;
    }
}