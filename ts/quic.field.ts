/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.view.ts" />
namespace Quic{
    
    
    
    
    
    

    export class Field implements IField {
        name:string;
        dataType:string;
        validations:{[index:string]:any};

        //视图类型
        viewType:string;
        //指定的css
        css:string;
        //文本
        text:string;
        //默认的权限
        permission:string;
        //字段集
        fieldset:IFieldset;
        // 视图创建器
        renderer:IRenderer;
        // 权限化的css
        CSS:ViewCSS;
        // 分组
        group?:string;
        // 位置
        position?:string;
        //数据路径
        mappath?:string;
        //定义
        opts:FieldOpts;
        //form构建时，不需要label
        nolabel:boolean;
        
        mappedValue:(data:{[index:string]:any},value?:any)=>any;

        accessFactory:IAccessFactory;
        
        constructor(fieldset:IFieldset,opts:FieldOpts){
            this.fieldset = fieldset;
            this.opts = opts;

            //字段名,去掉两边的空格
            this.name = opts.name?opts.name.replace(trimRegx,""):undefined;

            //必须有字段名
            if(!this.name) throw new Error("name is required for DataField");

            //数据类型，默认是string
            this.dataType = opts.dataType?(opts.dataType.replace(trimRegx,"")||"string"):"string";

            //视图类型&视图构造器
            let viewType:string = this.viewType=opts.viewType?(opts.viewType.replace(trimRegx,"")||this.dataType):this.dataType;
             this.renderer = this.fieldset.quic.findRenderer(viewType);
            if(!this.renderer) return env.throw("Invalid viewType",viewType);

            //nolabel
            if(viewType==="action" || viewType==="submit" || viewType==="reset" || viewType==="close" || viewType==="open" || viewType==="navigate"){
                this.nolabel = true;
            }else this.nolabel =opts.nolabel;
            
            //css 
            this.css=opts.css?(opts.css.replace(trimRegx,"")||this.css):this.dataType;
            this.CSS = new ViewCSS(this);
            //permission
            this.permission = opts.permission ;//;|| this.fieldset;
            this.position = opts.position;
            // mappath
            this.mappath =opts.mappath?opts.mappath.replace(trimRegx,""):undefined;
            this.mappedValue = mappedValue;
            this.mappedValue(null);
            
        }
        

        

        validationRule(validType:string):any{
            return this.validations ?this.validations[validType]:undefined;
        }
              
        
        validationTips(localization:ITextLocalizable){
            //没有定义验证规则，没有验证信息
            if(!this.validations){
                this.validationTips = ()=>undefined;
                return;
            }
            let msgs :{[index:string]:string}= {};
            let prefix :string = opts["validation-message-prefix"]||"valid-";

            for(var validType in this.validations){
                let validator:IValidate = validators[validType];
                if(validator){
                    
                    if(validType==="string" || validType==="text" || validType==="str") validType="length";
                    else if(validType==="number") validType="decimal";
                    let messageKey = prefix + validType;
                    let msg = localization._T(messageKey);
                    let parameter = this.validations[validType];
                    if(!parameter) {
                        msgs[validType] = msg;
                    }else {
                        let t = typeof parameter;
                        let submsg = "";
                        if(typeof parameter ==="object"){
                            for(var p in parameter){
                                let subkey:string = messageKey + p;
                                let subtxt:string = localization._T(subkey,false);
                                if(subtxt) {
                                    if(submsg)submsg += "," ;
                                    submsg += subtxt;
                                }
                            }
                        }else if(t==="string"){
                            submsg = localization._T(parameter.toString());
                        }
                        msgs[validType] = msg+(submsg?":"+submsg:"");
                    }
                }
            }
            for(let n in msgs){
                this.validationTips = ()=>msgs;
                return msgs;
            }
            this.validationTips = ()=>undefined;
            return;
        }

        validate(value:any,state?:any):string{
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
            let typeValidator:IValidate = validators[this.dataType];            
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
                    env.warn("unregistered validation type:" + validType);
                    continue;
                }
                let validParameter = validations[validType];
                let rs = validator(value,validParameter,this,state);
                if(rs===false) return validType;
                if(rs!==true)result=null;
                
            }
            return result; 
        }

        
        
        //static viewBuilders:{[viewType:string]:ViewBuilder}={};
    }
    
    export function mappedValue(data:{[index:string]:any},value?:any):any{
        let mappath = this.mappath;
        if(!mappath || mappath===this.name){
            this.mappedValue = function(data:{[index:string]:any},value?:any):any{
                if(value===undefined) return data?data[this.name]:undefined;
                if(data) data[this.name] = value;
                return this;
            }
        } else {
            this.mappedValue = this.getAccessor(mappath);
        }   
        return this.mappedValue(data,value);
    }
    export interface IValidate{
        (value:any,parameter?:any,field?:Field,state?:any):boolean;
    }
    let validators:{[validType:string]:IValidate}  ={};

    
    validators["length"]=(value:any,parameter?:any,field?:Field,state?:any):boolean=>{

        let val = (value===undefined||value===null)?0:value.toString().length;
        if(parameter && parameter.min && parameter.min>val) return false;
        if(parameter && parameter.max && parameter.max<val) return false;
        return true;
    }
    validators["string"] = validators["text"] = validators["length"];

    validators["int"]=(value:any,parameter?:any,field?:Field,state?:any):boolean=>{
        if(value===null || value===undefined)return;
        value=value.toString().replace(trimRegx,"");
        if(!value) return;
        if(!intRegx.test(value))return false;
            
        let val:number =parseInt(value);
        if(parameter && parameter.min && parameter.min>val) return false;
        if(parameter && parameter.max && parameter.max<val) return false;
        return true;
    }
    validators["decimal"]=(value:any,parameter?:any,field?:Field,state?:any):boolean=>{
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
    validators["email"]=(value:any,parameter?:any,field?:Field,state?:any):boolean=>{
        if(value===null || value===undefined || /\s+/.test(value))return;
        if(value===undefined || value===null) return null;
        return emailRegx.test(value);
    }
    //
    validators["url"] = (value:any,parameter?:any,field?:Field,state?:any):boolean=>{
        if(value===null || value===undefined || /\s+/.test(value))return;
        return urlRegx.test(value);
    }
    validators["regex"] = (value:any,parameter?:any,field?:Field,state?:any):boolean=>{
        if(value===null || value===undefined)return;
        
        let reg :RegExp ;
        try{
            reg = new RegExp(parameter);
        }catch(ex){
            throw Error("parameter is invalid regex:" + parameter);
        }

        return reg.test(value);
    }
    validators["remote"] = (value:any,parameter?:any,field?:Field,state?:any):boolean=>{
        
        throw new Error("Not implement");
    }
    
    
    
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