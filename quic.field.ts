namespace Y{
    export interface Utils{
        createElement:(tagName:string)=>HTMLElement;
        attach(element:HTMLElement,evt:string,handler:Function):void;
        detach(element:HTMLElement,evt:string,handler:Function):void;
        addClass(element:HTMLElement,css:string);
        removeClass(element:HTMLElement,css:string);
        hasClass(element:HTMLElement,css:string);
        alert(msg:string);
        confirm(msg:string);
        error:Function;
        warn:Function;
    }
    
   
    export interface FieldViewBuilder{
        //构建可编辑域
        editable?:(field:Field,validateRequired?:boolean)=>HTMLElement;
        //构建只读域
        readonly?:(field:Field)=>HTMLElement;
        //构建隐藏域
        hidden?:(field:Field,validateRequired?:boolean)=>HTMLElement;
        //
        getViewValue?:(field:Field)=>any;
        //提交时的回掉
        setViewValue?:(field:Field)=>void;
        validate?:(field:Field,result:{[fieldname:string]:any})=>boolean;
        extend?:string;
    }
    //权限种类
    export enum Permissions{
        disabled,
        editable,
        readonly,
        hidden
    }
    //数据域
    export interface DataField{
        //字段名
        name?:string;
        // 数据类型 默认是string
        dataType?:string;
        // 数据映射路径
        mappath?:string;
        // 验证规则集
        validations?:{[index:string]:any};
    }
    //视图域
    export interface ViewField extends DataField{
        //显示名，默认是name
        text?:string;
        //宽度
        width?:number;
        //需要添加的css
        css?:string;
        //视图类型 默认是text
        viewType?:string;
        //构造器
        builder?:FieldViewBuilder;
    }
    //列表域
    export interface ListField extends ViewField{
        //是否可排序
        sortable?:boolean;
        // 是否可拖动
        resizable?:boolean;
        // 是否是固定列
        frozen?:boolean;
        
    }
    export interface FieldOpts extends ViewField{
        permissions?:{[viewName:string]:Permissions|string};
        permission:Permissions|string;
    }
    export interface FieldContainer{
        fields:{[name:string]:Field};
        viewName:string;
        get_data():{[index:string]:any};
        waiting(msg:string);
        _T(key:string):string;
    }
    export enum SetFieldOptsMethods{
        //覆盖已有的值
        override,
        //如果已经赋值就忽略
        ignore,
        //值类型的就覆盖，引用类型的就追加
        append
    }
    export interface Validator{
        (field:Field,opts:any,_T?:(key:string)=>string):string;
    }

    export class Field implements ListField{
        container:FieldContainer;
        element:HTMLElement;
        // DataField:
        //字段名
        name?:string;
        // 数据类型 默认是string
        dataType?:string;
        // 数据映射路径
        mappath?:string;
        // 验证规则集
        validations?:{[index:string]:any};

        // ViewField:
        //显示名，默认是name
        text?:string;
        //宽度
        width?:number;
        //需要添加的css
        css?:string;
        //视图类型 默认是text
        viewType?:string;
        //构造器
        builder?:FieldViewBuilder;

        // ListField
        //是否可排序
        sortable?:boolean;
        // 是否可拖动
        resizable?:boolean;
        // 是否是固定列
        frozen?:boolean;
        viewArea_permissions?:{[viewArea:string]:Permissions|string};
        permission?:Permissions|string;
        constructor(container:FieldContainer,opts:FieldOpts){
            this.container.fields[opts.name] = this;
            for(let n in opts) setOptsValue(self,n,opts[n],SetFieldOptsMethods.override);
            if(!this.css) this.css="";
            if(!this.viewType) this.viewType="text";
            this.css += "field " + this.name + " viewtype-" + this.viewType;
            this._resetDirectData();
        }
        setOpts(opts:FieldOpts,method:SetFieldOptsMethods|string=SetFieldOptsMethods.override){
            let self :any = this;
            if(method == SetFieldOptsMethods.override || method==SetFieldOptsMethods[SetFieldOptsMethods.override] ){
                for(let n in opts) setOptsValue(self,n,opts[n],SetFieldOptsMethods.override);
            }else if(method == SetFieldOptsMethods.ignore || method==SetFieldOptsMethods[SetFieldOptsMethods.ignore] ){
                for(let n in opts) setOptsValue(self,n,opts[n],SetFieldOptsMethods.ignore);
            }else if(method == SetFieldOptsMethods.append || method==SetFieldOptsMethods[SetFieldOptsMethods.append] ){
                for(let n in opts) {
                    if(n=="css"){
                        if(this.css && opts.css) this.css += " " + opts.css;
                    }else{
                        setOptsValue(self,n,opts[n],SetFieldOptsMethods.ignore);
                    }
                }
            }
            if(!this.css) this.css="";
            this.css += " field " + this.name;
            
            this._resetDirectData();
            
        }
        get_builder():FieldViewBuilder{
            if(this.builder) return this.builder;
            let gbuilder = Field.getViewBuilder(this.viewType);
            return this.builder = {
                editable:gbuilder.editable,
                readonly:gbuilder.readonly,
                hidden:gbuilder.hidden,
                getViewValue :gbuilder.getViewValue,
                setViewValue:gbuilder.setViewValue
            };
        }
        

        get_value():any{
            let data:{[index:string]:any} = this.container.get_data();
            //获取构造器
            let builder = this.get_builder();
            //获取直接数据
            let directData = this.directData();
            
            if(this.element){
                //如果已经构建了element,优先从element中获取值
                let viewValue = builder.getViewValue(this);
                if(directData) directData[this.name] = viewValue;
                return viewValue;
            }else{
                // 如果还没有构建element,从data中获取值
                return directData?directData[this.name]:undefined;
            }
        }
        set_value(value?:any):Field{
            let data:{[index:string]:any} = this.container.get_data();
            //获取构造器
            let builder = this.get_builder();
            //获取直接数据
            let directData = this.directData();
            
            if(this.element){
                //如果已经构建了element,优先从element中获取值
                 builder.setViewValue(this);
            }
            // 如果还没有构建element,从data中获取值
            directData[this.name] = value;
            
            return this;
        }
        buildFormView(validateRequired?:boolean){
            let element = Field.utils.createElement("div");
            let perm = this.get_permission();
            element.className = this.css + Permissions[perm];
            let html = `<label class='field-label'></label><span class='field-wrapper'></span>`;
            if(perm == Permissions.editable) html += "<label class='field-validate-info'></label>";
            element.innerHTML = html;
            let builder = this.get_builder();
            let cell;
            switch(perm){
                case Permissions.editable:
                    cell = builder.editable(this,validateRequired);break;
                case Permissions.readonly:cell = builder.readonly(this);break;
                case Permissions.hidden:cell = builder.hidden(this);break;
            }     
            let wrapper = element.childNodes[1];  
            let rs;
            if(cell.inserted){
                rs ={inserted:cell.inserted,element:element};
                wrapper.appendChild(cell.element);   
            }else{
                wrapper.appendChild(rs =cell);   
            }
            return rs; 
        }
        get_permission():Permissions{
            let viewName = this.container.viewName||"";
            let perm = this.viewArea_permissions[viewName];
            if(perm===undefined) perm = this.permission;
            if(perm===undefined){
                viewName = viewName.toLowerCase();
                if(viewName.indexOf("update")>=0|| viewName.indexOf("edit")>=0) perm = Permissions.editable;
                else perm = Permissions.readonly;
            }
            return Permissions[perm];
        } 

        directData:()=>{[index:string]:any};
        private _resetDirectData(){
            this.directData= ():{[index:string]:any}=>{
                let mappath = this.mappath || this.name;
                let paths = mappath.split(".");
                if(paths.length==0){
                    this.directData = ()=>{return this.container.get_data();};
                }else{
                    let propname = paths.pop();
                    let code = "var data= this.container.get_data();\n";let p ="data";
                    for(let i=0,j=paths.length;i<j;i++){
                        p += "." + paths[i];
                        code += "if(!"+p+") " + p + "={};\n";
                    }
                    code += "return " + p + ";";
                    this.directData = new Function(code) as ()=>{[index:string]:any};
                }
                return this.directData();
            };
        }


        validate(result?:{[fieldname:string]:any}):boolean{
            let builder:FieldViewBuilder = this.get_builder();
            if(builder.validate) return builder.validate(this,result);
            if(!this.validations) return true;
            let hasError = false;
            let errors = result[this.name]||(result[this.name]={});
            for(let n in this.validations){
                let  opts = this.validations[n];
                let validator :Validator = validations[n];
                if(!validator){
                    Field.utils.warn("找不到验证函数" + n);
                    continue;
                }
                let error = validator(this,opts);
                if(error) {
                    errors[n]= error;
                    hasError=true;
                }
            }
            return hasError;
        }
        
        static validations:{[validateType:string]:Validator}={};

        static viewBuilders:{[viewType:string]:FieldViewBuilder}={};
        static getViewBuilder(viewType:string):FieldViewBuilder{
            let gbuilder :FieldViewBuilder = Field.viewBuilders[viewType||"text"]||Field.viewBuilders["text"] ;
            if(!gbuilder.editable|| !gbuilder.readonly || !gbuilder.hidden || !gbuilder.getViewValue || !gbuilder.setViewValue)  {
                if(gbuilder.extend){
                    let ebuilder = Field.getViewBuilder(gbuilder.extend);
                    if(!ebuilder) throw new Error("无法获取到FieldViewBuilder{viewType=" + gbuilder.extend + "}.如果要使用，请先注册。");
                    if(!ebuilder.editable|| !gbuilder.readonly || !gbuilder.hidden || !gbuilder.getViewValue || !gbuilder.setViewValue) {
                        throw new Error("FieldViewBuilder{viewType=" + gbuilder.extend + "}不完整.请注册editable,readonly,hidden,getViewValue,setViewValue;或extend一个完整的FieldViewBuilder");
                    }
                }else {
                    throw new Error("FieldViewBuilder{viewType=" + viewType + "}不完整.请注册editable,readonly,hidden,getViewValue,setViewValue;或extend一个完整的FieldViewBuilder");
                }
            }
            return gbuilder;
        }
        static utils:Utils;
        
    }
    function setOptsValue(dest:{[index:string]:any},key:string,value:any,method:SetFieldOptsMethods|string=SetFieldOptsMethods.override){
        let t = typeof value;
        if(method == SetFieldOptsMethods.override){
            
            if(t==="object") {
                let d = dest[key]||(dest[key]={});
                for(let m in value){
                    setOptsValue(d,m,value[m],method);
                }
            }else {
                dest[key] = value;
            }
        }else if(method == SetFieldOptsMethods.ignore ){
            if(t==="object") {
                let d = dest[key]||(dest[key]={});
                for(let m in value){
                    setOptsValue(d,m,value[m],method);
                }
            }else {
                if(dest[key]===undefined)dest[key] = value;
            }
        }
    }
    
    let viewBuilders:{[index:string]:FieldViewBuilder} = Field.viewBuilders;
    let textViewBuilder = {
        editable:(field:Field):HTMLElement=>{
            let elem:HTMLInputElement = Field.utils.createElement("input") as HTMLInputElement;
            elem.type = "text";
            let value = field.get_value();
            elem.value = (value===undefined||value===null)?"":value;

            Field.utils.attach(elem,"blur",()=>{
                field.set_value(elem.value);
            });
            return elem;
        },
        readonly:(field:Field):HTMLElement=>{
            let elem:HTMLInputElement = Field.utils.createElement("span") as HTMLInputElement;
            let value = field.get_value();
            elem.innerHTML = (value===undefined||value===null)?"":value;
            return elem;
        },
        hidden:(field:Field):HTMLElement=>{
            let elem:HTMLInputElement = Field.utils.createElement("input") as HTMLInputElement;
            elem.type = "hidden";
            let value = field.get_value();
            elem.value = (value===undefined||value===null)?"":value;
            return elem;
        },
        getViewValue:(field:Field):any=>{
            if(field.element){
                return field.element.tagName=="INPUT"
                    ?(field.element as HTMLInputElement).value
                    :(field.element as HTMLSpanElement).innerHTML;
            }
       },
        setViewValue:(field:Field,value:any):any=>{
            if(field.element){
                if(field.element.tagName=="INPUT"){
                    (field.element as HTMLInputElement).value=value===undefined||value===null?"":value;
                }else{
                    (field.element as HTMLSpanElement).innerHTML=value===undefined||value===null?"":value;
                }
                
            }
        }
    };
    let validations:{[validateType:string]:Validator} = Field.validations;
    validations.required = (field:Field,opts:any,_T:(key:string)=>string):string=>{
        let message = _T("required");
        if(!field)return message;
        let value = field.get_value();
        if(value && value.toString().replace(/(^\s+)|(\s+$)/g,"")) return "";
        return "required";
    }
    validations.length = (field:Field,opts:any,_T:(key:string)=>string):string=>{
        let message = "";
        if(field){
            let value = field.get_value();
            if(value===undefined||value===null) value="";
            else value = value.toString();
            if(opts.trim) value = value.replace(/(^\s+)|(\s+$)/g,"");
            let len = value.length;
            if(opts.min && len<opts.min) {
                if(!message) message = _T("length should ");
                message +=_T("more than ") + opts.min;
            }
            if(opts.max && len>opts.max) {
                if(!message) message =_T("length should ");
                else message += ",";
                message +=_T("less than ") + opts.max;
            }
        }else{
            if(opts.min) {
                if(!message) message = _T("length should ");
                message +=_T("more than ") + opts.min;
            }
            if(opts.max) {
                if(!message) message =_T("length should ");
                else message += ",";
                message +=_T("less than ") + opts.max;
            }
        }
        return message;
    }

}