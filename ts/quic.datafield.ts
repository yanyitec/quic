/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
namespace Quic{
    
    //Defination
    //数据字段定义选项
    export interface DataFieldOpts  {
        //字段名
        name?:string;
        // 数据映射路径
        mappath?:string;
    }
    export interface DataFieldDefs extends DataFieldOpts{
        // 数据类型 默认是string
        dataType?:string;
        // 验证规则集
        validations?:{[index:string]:any};
        
    }

    export interface IDataField extends DataFieldDefs{
        dataValidate : (value:any,state?:any)=>string;
        defs:DataFieldDefs;
    }
    
    export class DataField implements IDataField{
        name:string;
        dataType:string;
        dataPath:string;
        validations:{[index:string]:any};
        defs:DataFieldDefs;
       
        validate : (value:any,state?:any)=>string;
        constructor(defs:DataFieldDefs){
            //字段名,去掉两边的空格
            this.name = defs.name?defs.name.replace(trimRegx,""):undefined;
            //必须有字段名
            if(!this.name) throw new Error("name is required for DataField");
            //数据类型，默认是string
            this.dataType = defs.dataType?(defs.dataType.replace(trimRegx,"")||undefined):"string";
            // 验证信息
            this.validations = defs.validations;
            // 原始定义
            this.defs = defs;
            //验证跟数据验证是同一个函数
            this.validate = this.dataValidate;
        }
        
        
        validationInfos(_T:(txt:string,mustReturn?:boolean)=>string){
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