

namespace Quic{
    /**
     * 环境容器的抽象
     * 
     * @export
     * @interface Env
     */
    export interface Env{
        /**
         * 环境类型
         * browser,node
         * @type {string}
         * @memberof Env
         */
        type:string;
        /**
         * 跳转浏览器的url
         * 
         * @param {string} url 要跳转的url
         * @param {(doc?:HTMLDocument)=>void} complete 跳转完成后的回调??真的可以回调？？？？
         * @memberof Env
         */
        navigate(url:string,complete:(doc?:HTMLDocument)=>void);
        /**
         * 弹出一个警告框，icon为感叹号
         * 
         * @param {string} message 要显示的提示信息
         * @param {string} [title] 标题
         * @memberof Env
         */
        alert(message:string,title?:string);
        /**
         * 弹出一个确认框，icon为问号
         * 
         * @param {string} message 要显示的确认信息 
         * @param {string} [title] 
         * @memberof Env
         */
        confirm(msg:string,title?:string);
        /**
         * 记录错误并扔出异常Error
         * 
         * @type {Function}
         * @memberof Env
         */
        throw:Function;
        /**
         * 对控制台error的抽象
         * 
         * @type {Function}
         * @memberof Env
         */
        error:Function;
        /**
         * 对控制台警告的抽象
         * 
         * @type {Function}
         * @memberof Env
         */
        warn:Function;
    }

    /**
     * 对DOM操作的抽象
     * env.type===browser，就是HTMLElement
     * env.type===node,就是虚拟节点(待实现)
     * @export
     * @interface Dom
     */
    export interface Dom{
        type:string;
        /**
         * 创建Dom元素
         * 
         * @param {string} tagName 元素标签
         * @returns {HTMLElement} 创建的元素对象
         * @memberof Dom
         */
        createElement(tagName:string):HTMLElement;
        /**
         * 给元素添加事件监听
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        attach(element:HTMLElement,evtname:string,listener:Function):void;
        /**
         * 移除元素上的事件监听
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        detach(element:HTMLElement,evtname:string,listener:Function):void;
        /**
         * 给元素添加css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要添加的css
         * @memberof Dom
         */
        addClass(element:HTMLElement,css:string):void;
         /**
         * 移除元素上的css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要移除的css
         * @memberof Dom
         */
        removeClass(element:HTMLElement,css:string):void;
        /**
         * 检查元素上是否具有某个css
         * 
         * @param {HTMLElement} element 元素对象
         * @param {string} css 
         * @memberof Dom
         */
        hasClass(element:HTMLElement,css:string);
    }
    /**
     * 可释放对象，用于自动回收
     * 
     * @export
     * @interface IDisposable
     */
    export interface IDisposable{
        ref_count?:number;
        dispose?():void;
        aquire():void;
        release?():void;
    }
    
    /**
     * 视图参数。
     * 用于创建视图
     * 
     * @export
     * @interface ViewOpts
     */
    export interface ViewOpts{
        /**
         * 名称
         * 
         * @type {string}
         * @memberof ViewOpts
         */
        name?:string;
        /**
         * 类型，对象着某个Renderer(呈现器)
         * 
         * @type {string}
         * @memberof ViewOpts
         */
        viewType?:string;
        /**
         * 该视图要使用的css
         * 
         * @type {string}
         * @memberof ViewOpts
         */
        css?:string;
        /**
         * 视图标题/文本/显示用的名字
         * 
         * @type {string}
         * @memberof ViewOpts
         */
        text?:string;
        /**
         * 视图分组
         * 用于在form中分组显示
         * 
         * @type {string}
         * @memberof ViewOpts
         */
        group?:string;
        /**
         * 视图权限。可能的值有
         * disabled:禁用
         * visible:只是可视 ，存在input
         * hidden:隐藏的视图；不可见，但是存在(input)
         * readonly:只读，不可修改，不可reset，存在input
         * editable:可编辑,忽略验证
         * validatable:可编辑，可验证
         * @type {string}
         * @memberof ViewOpts
         */
        permission?:string;
        /**
         * 数据映射路径，其值来源/存储在data的那个位置
         * 
         * @type {string}
         * @memberof ViewOpts
         */
        mappath?:string;
     }

     /**
      * 字段参数
      * 用于定义字段用        
      * 在fieldset配置中，字段属性跟视图属性是一起定义的，所以FieldOpts继承自ViewOpts
      * 但viewOpts会在运行期重新被指派，而FieldOpts的值会在整个运行期保持不变，所以要拆分成2各接口来区分这种调用上的约定安排。
      * @export
      * @interface FieldOpts
      * @extends {ViewOpts} 可当作视图选项来使用
      */
    
      export interface FieldOpts extends ViewOpts{
        /**
         * 数据类型 默认是string
         * 
         * @type {string}
         * @memberof FieldOpts
         */
        dataType?:string;
        /**
         * // 验证规则集
         * 
         * @type {{[index:string]:any}}
         * @memberof FieldOpts
         */
        validations?:{[index:string]:any};
        
    }

    /**
     * 多语言本地化处理接口
     * 
     * @export
     * @interface ITextLocalizable
     */
    export interface ITextLocalizable{
        /**
         * 多语言化的词典
         * 
         * @type {{[key:string]:string}}
         * @memberof ITextLocalizable
         */
        langs?:{[key:string]:string};
        //多语言文本处理
        _T(text:string,mustReturn?:boolean);
    }

    /**
     * 可做数据验证的对象
     * 
     * @export
     * @interface IValidatable
     */
    export interface IValidatable{
        /**
         * 验证数据
         * 
         * @param {*} value 要验证的值
         * @param {*} [state] 当前上下文，一般传递view
         * @returns {*} undefined=成功,null=正在进行,string=某验证规则错误
         * @memberof IValidatable
         */
        validate(value:any,state?:any):string;
        /**
         * 获取指定的验证规则
         * 
         * @param {string} validType 验证类型
         * @returns {*} 验证参数
         * @memberof IValidatable
         */
        validationRule(validType:string):any;
        /**
         * 获取验证规格提示信息
         * 
         * @param {ITextLocalizable} [localization] 多语言本地化处理器，默认是Quic的全局处理器
         * @returns {{[index:string]:string}} 
         * @memberof IValidatable
         */
        validationTips(localization?:ITextLocalizable):{[index:string]:string};
    }

    /**
     * 可做数据映射的对象
     * 
     * @export
     * @interface IDataMappable
     */
    export interface IDataMappable{
        /**
         * 数据映射路径
         * 
         * @type {string}
         * @memberof IDataMappable
         */
        mappath?:string;
        /**
         * 根据映射路径设置/获取数据对象上的值
         * 
         * @param {{[index:string]:any}} data 数据对象
         * @param {*} [value] 要设置的值。填写了表示set
         * @returns {*} 
         * @memberof IDataMappable
         */
        mappedValue:(data:{[index:string]:any},value?:any)=>any;
    }
    
    /**
     * 字段(定义)接口，代表一个数据字段/视图域
     * 可当作字段定义选项来使用
     * 可做数据验证
     * 可做数据映射
     * @export
     * @interface IField
     * @extends {FieldOpts} 字段定义可当作字段定义选项来使用
     * @extends {IValidatable} 可做数据验证
     * @extends {IDataMappable} 可做数据映射
     */
    export interface IField extends FieldOpts,IValidatable,IDataMappable{
        /**
         * 字段集对象
         * 
         * @type {IFieldset}
         * @memberof IField
         */
        fieldset:IFieldset;
        /**
         * 原始的定义选项
         * 
         * @type {FieldOpts}
         * @memberof IField
         */
        opts:FieldOpts;
    }

    /**
     * 字段集定义
     * 常用于json定义
     * @export
     * @interface FieldsetDefs
     */
    export interface FieldsetDefs {
        /**
         * 字段集名称。缺省为module的名称
         * 
         * @type {string}
         * @memberof FieldsetDefs
         */
        name?:string;
        /**
         * 字段定义集合
         * 
         * @type {{[index:string]:FieldOpts}}
         * @memberof FieldsetDefs
         */
        fields:{[index:string]:FieldOpts};
    }
    /**
     * 字段集选项。常用于创建字段集时的参数
     * 可当作字段集定义使用
     * @export
     * @interface FieldsetOpts
     * @extends {FieldsetDefs} 可当作字段集定义使用
     */
    export interface FieldsetOpts extends FieldsetDefs{
        
        /**
         * 模块
         * 
         * @type {IModule}
         * @memberof FieldsetOpts
         */
        module:IModule;
           
    }

    export interface IFieldset {
        /**
         * 原始字段集选项
         * 
         * @type {FieldsetOpts}
         * @memberof IFieldset
         */
        opts:FieldsetOpts;
        /**
         * 该字段集里面的字段定义
         * 
         * @type {{[index:string]:IField}}
         * @memberof IFieldset
         */
        fields:{[index:string]:IField};
        /**
         * 该字段集所属模块
         * 
         * @type {IModule}
         * @memberof IFieldset
         */
        module:IModule;
        //fieldValue(fieldOpts:FieldOpts,fieldElement:HTMLElement,data:any,value?:any):any;
    }

     /**
      * 组合后的css
      * 缓存各权限的css字符串
      * 
      * @export
      * @interface IViewCSS
      */
     export interface IViewCSS{
        /**
         * 原始css字符串
         * 
         * @type {string}
         * @memberof ViewCss
         */
        raw:string;
        /**
         * 未加上权限节的css字符串
         * 
         * @type {string}
         * @memberof ViewCss
         */
        base:string;
        /**
         * 获取某个权限下的css字符串
         * 
         * @param {string} [permission] 权限名
         * @returns {string} 
         * @memberof IViewCSS
         */
        css(permission?:string):string;
        /**
         * 不带权限节的css字符串
         * 
         * @returns {string} 
         * @memberof IViewCSS
         */
        general():string;

        /**
         * visible(只可见)时view上的cssName
         * 
         * @returns {string} 付给cssName的字符串
         * @memberof ViewCss
         */
        visible():string;
        /**
         * hidden(隐藏)时view上的cssName
         * 
         * @returns {string} 付给cssName的字符串
         * @memberof ViewCss
         */
        hidden():string;
        /**
         * readonly(只读)时view上的cssName
         * 
         * @returns {string} 付给cssName的字符串
         * @memberof ViewCss
         */
        readonly():string;
        /**
         * editable(可编辑)时view上的cssName
         * 
         * @returns {string} 付给cssName的字符串
         * @memberof ViewCss
         */
        editable():string;
        /**
         * validatable(可验证)时view上的cssName
         * 
         * @returns {string} 付给cssName的字符串
         * @memberof ViewCss
         */
        validatable():string;
        toString():string;
    }
    /**
     * 抽象的视图
     * 
     * @export
     * @interface IView
     * @extends {ViewOpts}
     */
    export interface IView extends ViewOpts{
        /**
         * 视图所属的视图集对象
         * 
         * @type {IViewset}
         * @memberof IView
         */
        viewset?:IViewset;
        /**
         * 该视图是根据那个field来创建的
         * 
         * @type {IField}
         * @memberof IView
         */
        field?:IField;
        /**
         * 视图将要用到的css集合
         * 
         * @type {IViewCSS}
         * @memberof IView
         */
        CSS?:IViewCSS;
        /**
         * 呈现器，用于呈现该view
         * 
         * @type {Renderer}
         * @memberof IView
         */
        renderer:IRenderer;
        /**
         * get/set data上经过映射(mappath)的上的值
         * 
         * @param {{[index:string]:any}} data 根数据
         * @param {*} [value] 设置了该值表示setter
         * @returns {*} 
         * @memberof IView
         */
        mappedValue:(data:{[index:string]:any},value?:any)=>any;
        /**
         * get/set 视图上的值
         * 
         * @param {*} [value] 设置了该值表示setter
         * @returns {*} 
         * @memberof IView
         */
        viewValue(value?:any):any;
        /**
         * 该视图对象的元素
         * 
         * @returns {HTMLElement} 
         * @memberof IView
         */
        element():HTMLElement; 
    }

    /**
     * 视图集合选项。创建视图集时作为参数
     * 可以当作视图选项来用
     * @export
     * @interface ViewsetOpts
     * @extends {ViewOpts} 可以当作视图选项来用
     */
    export interface ViewsetOpts extends ViewOpts{
    
        /**
         * //要包含的域s表达式或域s配置
         * 域表达式的例子: [id:hidden,name:validatable,pwd:validatable],person[gender:editable]
         * @type {(string | {[fieldname:string]:FieldOpts})}
         * @memberof ViewsetOpts
         */
        includes?:string | {[fieldname:string]:FieldOpts};
        /**
         * 要排除的字段/域的名字
         * 
         * @type {(string | Array<string>)}
         * @memberof ViewsetOpts
         */
        excludes?:string | Array<string>;
        /**
         * //初始化数据
         * 
         * @type {{[index:string]:any}}
         * @memberof ViewsetOpts
         */
        initData?:{[index:string]:any};

        /**
         * 获取/提交数据的url
         * 
         * @type {string}
         * @memberof ViewsetOpts
         */
        url?:string;
        /**
         * 获取/提交数据用的方法GET/POST/PUT etc.
         * 
         * @type {string}
         * @memberof ViewsetOpts
         */
        method?:string;
        
    }
    
    /**
     * 视图集。里面有多个view
     * 
     * @export
     * @interface IViewset
     * @extends {IView}
     * @extends {ViewsetOpts}
     */
    export interface IViewset extends IView,ViewsetOpts{
        /**
         * 原始的视图集选项
         * 
         * @type {ViewsetOpts}
         * @memberof IViewset
         */
        opts:ViewsetOpts;
        /**
         * 该视图集由哪个字段集生成
         * 
         * @type {IFieldset}
         * @memberof IViewset
         */
        fieldset:IFieldset;
        /**
         * 所属模块
         * 
         * @type {IModule}
         * @memberof IViewset
         */
        module:IModule;
        /**
         * 视图集中的视图对象
         * 
         * @type {{[index:string]:IView}}
         * @memberof IViewset
         */
        views:{[index:string]:IView}; 
        /**
         * 当前数据
         * 
         * @type {{[index:string]:any}}
         * @memberof IViewset
         */
        currentData:  {[index:string]:any};
        /**
         * 父视图集,open的时候会产生
         * 
         * @type {IViewset}
         * @memberof IViewset
         */
        parentview?:IViewset;
        /**
         * 堆中前一个视图集
         * 
         * @type {IViewset}
         * @memberof IViewset
         */
        stack_prev:IViewset;
        /**
         * 视图堆栈栈底元素
         * 
         * @type {IViewset}
         * @memberof IViewset
         */
        stack_bottom:IViewset;
        /**
         * 视图堆栈栈顶元素
         * 
         * @type {IViewset}
         * @memberof IViewset
         */
        stack_top:IViewset;
        /**
         * 关闭该视图集
         * 
         * @memberof IViewset
         */
        close();
    }

    
    /**
     * 呈现视图的方法
     * 
     * @export
     * @interface IRender
     */
    export interface IRender{

        (view:IView):HTMLElement;
    }
    
    /**
     * 视图呈现器
     * 
     * @export
     * @interface IRenderer
     */
    export interface IRenderer{
        /**
         * 只可见，没有input元素跟着
         * 
         * @type {IRender}
         * @memberof IRenderer
         */
        visible:IRender;

        /**
         * 隐藏，但是有input元素
         * 
         * @type {IRender}
         * @memberof IRenderer
         */
        hidden:IRender;
        /**
         * 只读，不能修改，但是有input元素
         * 
         * @type {IRender}
         * @memberof IRenderer
         */
        readonly:IRender;
        /**
         * 可编辑
         * 
         * @type {IRender}
         * @memberof IRenderer
         */
        editable:IRender;
        /**
         * 设置View的值，并让view反映该值。但并不展现waiting蒙版
         * 
         * @param {IView} view 
         * @param {*} value 
         * @returns {*} 
         * @memberof IRenderer
         */
        setValue(view:IView,value:any):any;
        /**
         * 获取到该view上的值。
         * 
         * @param {IView} view 
         * @returns {*} 
         * @memberof IRenderer
         */
        getValue(view:IView):any;
        /**
         * 给该view添加事件监听。默认调用dom的attach
         * 
         * @param {IView} view 
         * @param {string} evtname 
         * @param {Function} listener 
         * @memberof IRenderer
         */
        attach?(view:IView,evtname:string,listener:Function):void;
        /**
         * 从view中删除事件监听。默认调用dom的detech
         * 
         * @param {IView} view 
         * @param {string} evtname 
         * @param {Function} listener 
         * @memberof IRenderer
         */
        detech?(view:IView,evtname:string,listener:Function):void;
        /**
         * 触发view上的某个事件。默认调用dom.notify
         * 
         * @param {IView} view 
         * @param {string} evtname 
         * @param {*} evtArgs 
         * @memberof IRenderer
         */
        notify?(view:IView,evtname:string,evtArgs:any):void;
        
    }

    /**
     * viewtype=submit / button/action/reset时，的选项配置
     * 
     * @export
     * @interface ActionOpts
     * @extends {ViewOpts}
     */
    export interface ActionOpts extends ViewOpts{
        /**
         * //点击后的行为。如果不以#开头，就在controller里面找相关的event
         * 默认什么都不发生
         * #open 本viewset不退栈，把本viewset当作当前容器，打开一个新的由module指定的viewset
         * #new=本viewset不退栈，在栈顶创建一个新的viewset
         * #submit= 默认提交，完成后提示提交成功，并close
         * #refresh=刷新target指定的view,
         * #close=关闭当前的viewset，显示viewstack下面的viewset的内容
         * #target = 刷新target指定的占位区域
         * #navigate = 浏览器跳转
         * @type {string}
         * @memberof ActionOpts
         */
        action?:string;
        /**
         * 该链接/按键点击之后，会刷新某个区域，不填写默认为本viewset区域
         * 
         * @type {string}
         * @memberof ActionOpts
         */
        target?:string;
        //当action=new/action=target时，会使用module字段打开指定的module.
        module?:string;

    }

    /**
     * 控制器，viewset会调用上面的函数
     * 每个viewset都有一个控制器实例
     * 
     * @export
     * @interface IController
     * @extends {IDisposable}
     */
    export interface IController extends IDisposable{
        /**
         * 当前的viewset,creating之后才会有值
         * 
         * @type {IViewset}
         * @memberof IController
         */
        viewset:IViewset;
        /**
         * 创建视图集合前。
         * 作用: 有机会修改opts
         * 状态: element不可用,initData,currentData不可用
         * @param {IViewset} parentview 父视图集
         * @param {IFieldset} fieldset 用那个字段集合创建该viewset
         * @param {ViewsetOpts} opts  创建参数
         * @param {ViewsetOpts} creator 那个view出发的该创建
         * @memberof IController
         */
        creating?(parentview:IViewset,fieldset:IFieldset,opts:ViewsetOpts,creator?:IView);
        /**
         * 名称: 绑定数据前。
         * 作用: 有机会修改绑定的数据
         * 状态: element不可用,initData,currentData不可用
         * @param {IViewset} viewset 
         * @param {{[index:string]:any}} data 将要用于绑定的数据
         * @returns {*} 如果!=undefined，会用返回值替换掉data
         * @memberof IController
         */
        binding?(viewset:IViewset,data:{[index:string]:any}):any;
        /**
         * 名称: 呈现元素前。
         * 作用: 有机会修改视图里面的htmlelement。
         * 状态: element不可用,initData,currentData已赋值。element已经创建，但还没有加载到document里面
         * @param {IViewset} viewset 
         * @memberof IController
         */
        rendering?(viewset:IViewset);
        /**
         * 名称: 呈现元素后。
         * 作用: 有机会修改调整在document中的视图的element。
         * 状态: element已能用,initData,currentData已赋值。
         * @param {IViewset} viewset 
         * @memberof IController
         */
        rendered?(viewset:IViewset);
    }
    /**
     * 创建module的选项
     * 
     * @export
     * @interface ModuleOpts
     * @extends {FieldsetDefs}
     * @extends {IController}
     */
    export interface ModuleOpts extends FieldsetDefs,IController{
        /**
         * 该module才会用到的视图呈现器
         * 
         * @type {{[name:string]:IRenderer}}
         * @memberof ModuleOpts
         */
        renders?:{[name:string]:IRenderer};
        /**
         * 该moudule的控制器
         * 
         * @type {(IController|Function)}
         * @memberof ModuleOpts
         */
        controller?:IController|Function;
        /**
         * 需要额外加载的资源
         * 
         * @type {(Array<string>|string)}
         * @memberof ModuleOpts
         */
        resources:Array<string>|string;
        
        langs?:{[index:string]:string};
    }
    
    /**
     * 模块
     * 可本地化
     * 可做数据映射
     * 可以控制销毁
     * @export
     * @interface IModule
     * @extends {ITextLocalizable} 可本地化
     * @extends {IDataMappable} 可做数据映射
     * @extends {IDisposable} 可以控制销毁
     */
    export interface IModule extends ITextLocalizable,IDataMappable,IDisposable{
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
         * 事件集合 viewname/fieldname/evtname
         * 从controller中分析出来
         * @type {[viewname:string]:any}
         * @memberof IModule
         */
        events:{[viewname:string]:any};
        /**
         * 获取事件监听器
         * 
         * @param {string} evtName 事件名
         * @param {string} [viewname] 视图名，默认为viewset的
         * @returns {*} 
         * @memberof IModule
         */
        getEventListener(evtName:string,viewname?:string):any;
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
        
    }
    /**
     * 模块加载器
     * 
     * @export
     * @interface ILoadModule
     */
    export interface ILoadModule{
        (name:string|ModuleOpts,complete:(module:Module)=>void);
    }

    /**
     * 加载模块
     * 
     * @export
     * @function
     */
    export let loadModule :ILoadModule;

}
