/// <reference path="quic.ts" />
/// <reference path="quic.env.ts" />
namespace Quic{
    
    //Defination
    //数据字段定义选项
    export interface DataFieldOpts {
        //字段名
        name?:string;
        // 数据类型 默认是string
        dataType?:string;
        // 数据映射路径
        dataPath?:string;
       
        // 验证规则集
        validations?:{[index:string]:any};
        
    }
    
    export class DataField{
        name:string;
        dataType:string;
        dataPath:string;
        validations:{[index:string]:any};
        opts:any;
        _accessorFactory:DataAccessorFactory;
        _T:(key:string,mustReturn?:boolean)=>string;
        validate : (value:any,state?:any)=>string;
        constructor(opts:DataFieldOpts){
            //字段名,去掉两边的空格
            this.name = opts.name?opts.name.replace(trimRegx,""):undefined;
            //必须有字段名
            if(!this.name) throw new Error("name is required for DataField");
            //数据类型，默认是string
            this.dataType = opts.dataType?(opts.dataType.replace(trimRegx,"")||undefined):"string";
            // 验证信息
            this.validations = opts.validations;
            // 原始定义
            this.opts = opts;
            //验证跟数据验证是同一个函数
            this.validate = this.dataValidate;
        }
        
        value(data:{[index:string]:any},val?:any):any{
            this.value = (this._accessorFactory|| DataAccessorFactory.instance).cached(this.dataPath||this.name);
            return this.value(data,val);
        }
        dataValue(data:{[index:string]:any},val?:any):any{
            this.dataValue = (this._accessorFactory|| DataAccessorFactory.instance).cached(this.dataPath|| this.name);
            return this.dataValue(data,val);
        }
        validationInfos(_T:(txt:string,mustReturn?:boolean)=>string,accessorFactory:DataAccessorFactory,state?:any){
            //没有定义验证规则，没有验证信息
            if(!this.validations){
                this.validationInfos = ()=>undefined;
                return;
            }
            let msgs :{[index:string]:string}= {};
            let prefix :string = opts["validation-message-prefix"]||"valid-";

            for(var validType in this.validations){
                let validator:Validator = validators[validType];
                if(validator){
                    if(!_T) _T =(txt:string,mustReturn?:boolean):string=>langs[txt]||(mustReturn===false?undefined:txt);
                    if(validType==="string" || validType==="text" || validType==="str") validType="length";
                    else if(validType==="number") validType="decimal";
                    let messageKey = prefix + validType;
                    let msg = _T(messageKey);
                    let parameter = this.validations[validType];
                    if(!parameter) {
                        msgs[validType] = msg;
                    }else {
                        let t = typeof parameter;
                        let submsg = "";
                        if(typeof parameter ==="object"){
                            for(var p in parameter){
                                let subkey:string = messageKey + p;
                                let subtxt:string = _T(subkey,false);
                                if(subtxt) {
                                    if(submsg)submsg += "," ;
                                    submsg += subtxt;
                                }
                            }
                        }else if(t==="string"){
                            submsg = _T(parameter.toString());
                        }
                        msgs[validType] = msg+(submsg?":"+submsg:"");
                    }
                }
            }
            for(let n in msgs){
                this.validationInfos = ()=>msgs;
                return msgs;
            }
            this.validationInfos = ()=>undefined;
            return;
        }

        dataValidate(value:any,state?:any):string{
            let validations = this.validations;
            if(!validations) { return ;}
            let hasError = false;
            
            //let value = this.value(data);
            let required_v = validations["required"];
            
            if(required_v){
                let val = value?value.toString().replace(trimRegx,""):"";
                if(!val) {
                    return "required";
                }
            }
            let type_v = validations[this.dataType];
            let typeValidator:Validator = validators[this.dataType];            
            if(typeValidator){
                if(typeValidator(value,type_v,this,state)===false){
                    return this.dataType.toString();
                }
            }
            let result:string;
            for(var validType in validations){
                if(validType==="required" || validType===this.dataType) continue;
                let validator = validators[validType];
                if(!validator){
                    Quic.env.warn("unregistered validation type:" + validType);
                    continue;
                }
                let validParameter = validations[validType];
                let rs = validator(value,validParameter,this,state);
                if(rs===false) return validType;
                if(rs!==true)result=null;
                
            }
            return result; 
        }
        static validationMessagePrefix:string ="valid-message-";
        
    }
    export interface DataAccessor{
        getter?:()=>any;
        setter?:(value:any)=>any;
        dataObject?:()=>any;
    }
    
    
    export class DataAccessorFactory{
        caches:{[dataPath:string]:(data:{[index:string]:any},value?:any)=>any};
        constructor(){
            this.caches = {};
        }
        cached(dataPath:string):(data:{[index:string]:any},value?:any)=>any{
            let accessor:(data:{[index:string]:any},value?:any)=>any =  this.caches[dataPath];
            if(!accessor){
                accessor = this.caches[dataPath] = DataAccessorFactory.create(dataPath);
            }
            return accessor;
        }
        static create : (dataPath:string)=>(data:{[index:string]:any},value?:any)=>any = (dataPath:string):(data:{[index:string]:any},value?:any)=>any=>{
            if(dataPath=="$"){
                return function(data:{[index:string]:any},value?:any):any{
                    if(value===undefined) return data;
                    throw new Error("setting cannot apply for datapath[$]");
                };
            }
            let paths = dataPath.split(".");
            
            let last_propname = paths.shift().replace(trimRegx,"");
            if(!last_propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            let codes = {
                path:"data",
                getter_code:"",
                setter_code:""
            };
            for(let i =0,j=paths.length;i<j;i++){
                let propname = paths[i].replace(trimRegx,"");
                buildPropCodes(propname,dataPath,codes);
            }
            buildPropCodes(last_propname,dataPath,codes,true);
            let code = "if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code +="var at;\nif(value===undefined){\n" +codes.getter_code + "\treturn data;\n}else{\n" + codes.setter_code + "\n}\n";
            return new Function("data",code) as (data:{[index:string]:any},value?:any)=>any;
            
        };
        static cached(dataPath:string):(data:{[index:string]:any},value?:any)=>any{
            return DataAccessorFactory.instance.cached(dataPath);
        }
        static instance:DataAccessorFactory = new DataAccessorFactory();
    }
    export function str_replace(text:any,data?:any,accessorFactory?:DataAccessorFactory){
        if(text===null || text===undefined) text="";
        else text = text.toString();
        //if(!data){ return text;}
        let regx = /\{([a-zA-Z\$_0-9\[\].]+)\}/g;
        accessorFactory || (accessorFactory=DataAccessorFactory.instance);
        return text.replace(regx,function(m){
            let accessor :(data:{[index:string]:any},value?:any)=>any;
            let expr :string = m[1];
            try{
                accessor = accessorFactory.cached(expr);
            }catch(ex){
                Quic.env.warn("Invalid datapath expression:" + expr);
                return "{INVALID:"+expr+"}";
            }
            return data?accessor(data):"";
        });
    }
    export interface Validator{
        (value:any,parameter?:any,field?:DataField,state?:any):boolean;
    }
    let validators:{[validType:string]:Validator}  ={};

    
    validators["length"]=(value:any,parameter?:any,field?:DataField,state?:any):boolean=>{

        let val = (value===undefined||value===null)?0:value.toString().length;
        if(parameter && parameter.min && parameter.min>val) return false;
        if(parameter && parameter.max && parameter.max<val) return false;
        return true;
    }
    validators["string"] = validators["text"] = validators["length"];

    validators["int"]=(value:any,parameter?:any,field?:DataField,state?:any):boolean=>{
        if(value===null || value===undefined)return;
        value=value.toString().replace(trimRegx,"");
        if(!value) return;
        if(!intRegx.test(value))return false;
            
        let val:number =parseInt(value);
        if(parameter && parameter.min && parameter.min>val) return false;
        if(parameter && parameter.max && parameter.max<val) return false;
        return true;
    }
    validators["decimal"]=(value:any,parameter?:any,field?:DataField,state?:any):boolean=>{
        if(value===null || value===undefined)return;
        value=value.toString().replace(trimRegx,"");
        if(!value) return;
        let match :RegExpMatchArray = value.match(decimalRegx);
        if(!match)return false;
        
        if(parameter && parameter.ipart && match[0].replace(/,/g,"").length>parameter.ipart)return false;
        if(parameter && parameter.fpart && match[1] && match[1].length-1>parameter.fpart)return false;

        let val:number =parseFloat(value);
        if(parameter && parameter.min && parameter.min>val) return false;
        if(parameter && parameter.max && parameter.max<val) return false;
        return true;
    }
    validators["email"]=(value:any,parameter?:any,field?:DataField,state?:any):boolean=>{
        if(value===null || value===undefined || /\s+/.test(value))return;
        if(value===undefined || value===null) return null;
        return emailRegx.test(value);
    }
    //
    validators["url"] = (value:any,parameter?:any,field?:DataField,state?:any):boolean=>{
        if(value===null || value===undefined || /\s+/.test(value))return;
        return urlRegx.test(value);
    }
    validators["regex"] = (value:any,parameter?:any,field?:DataField,state?:any):boolean=>{
        if(value===null || value===undefined)return;
        
        let reg :RegExp ;
        try{
            reg = new RegExp(parameter);
        }catch(ex){
            throw Error("parameter is invalid regex:" + parameter);
        }

        return reg.test(value);
    }
    validators["remote"] = (value:any,parameter?:any,field?:DataField,state?:any):boolean=>{
        
        throw new Error("Not implement");
    }
    export let arrRegx:RegExp =/(?:\[\d+\])+$/g;
    export let trimRegx:RegExp = /(^\s+)|(\s+$)/g;
    export let urlRegx :RegExp = /^\s*(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/g;
    export let emailRegx :RegExp = /^\s*[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?\s*$/g;
    export let intRegx :RegExp = /(^[+\-]?\d+$)|(^[+\-]?\d{1,3}(,\d{3})?$)/;
    export let decimalRegx:RegExp= /^((?:[+\-]?\d+)|(?:[+\-]?\d{1,3}(?:\d{3})?))(.\d+)?$/;
    function buildPropCodes(propname:string,dataPath,codes:any,isLast?:boolean){
        if(!propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        let match = arrRegx.exec(propname);
        let nextObjValue="{}";
        let sub=undefined;
        if(match){
            sub = match.toString();
            propname = propname.substring(0,propname.length-sub.length);
            nextObjValue="[]";
        }
        codes.path +="." + propname;
        codes.getter_code += `\tif(!data.${propname})return undefined;else data=data.${propname};\n`;
        codes.setter_code += `\tif(!data)data.${propname}=${nextObjValue};\n`;
        if(sub) {
            let subs = sub.substr(1,sub.length-2).split(/\s*\]\s*\[\s*/g);
            for(let m=0,n=subs.length-1;m<=n;m++){
                let indexAt = subs[m];
                if(indexAt==="first"){
                    codes.getter_code += `\tif(!data[0])return undefined;else data = data[0];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) codes.setter_code += `\tif(!data[0]) data[0] = value;\n`;
                        else codes.setter_code += `\tif(!data[0]) data = data[0]={};else data=data[0];\n`;
                    }else{
                        codes.setter_code += `\tif(!data[0]) data[0]=[]"\n`;
                    }
                }else if(indexAt==="last"){
                    codes.getter_code += `\tat = data.length?data.length-1:0; if(!data[at])return undefined;else data = data[at];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) codes.setter_code += `\tat = data.length?data.length-1:0; if(!data[at]) data[at]=value";\n`;
                        else codes.setter_code += `\tat = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n`;
                    }else{
                        codes.setter_code += `\tat = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n`;
                    }
                }else {
                    if(!/\d+/.test(indexAt)) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += `\tif(!data[${indexAt}])return undefined;else data = data[${indexAt}];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) codes.setter_code += `\tif(!data[${indexAt}]) data[${indexAt}]=value";\n`;
                        else codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]={};else data=data[${indexAt}];\n`;
                    }else{
                        codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]=[];else data=data[${indexAt}];\n`;
                    }
                }       
            }
            
        }
    }
    export let opts={
        "validation-message-prefix":"valid-"
    };
    export let langs = {
        "valid-required":"必填",
        "valid-length":"字符个数",
        "valid-length-min":"至少{min}",
        "valid-length-max":"最多{max}",
        "valid-length-min-max":"{min}-{max}个",
        "valid-int":"必须是整数",
        "valid-int-min":"最小值为{min}",
        "valid-int-max":"最大值为{max}",
        "valid-int-min-max":"取值范围为{min}-{max}",
        "valid-decimal":"必须是数字",
        "valid-decimal-min":"最小值为{min}",
        "valid-decimal-max":"最大值为{max}",
        "valid-decimal-min-max":"取值范围为{min}-{max}",
        "valid-decimal-ipart":"整数部分最多{min}位",
        "valid-decimal-fpart":"小数部分最多{max}位",
        "valid-email":"必须是电子邮件地址格式",
        "valid-url":"必须是URL地址格式",
        "valid-regex":"必须符合格式"
    };
}