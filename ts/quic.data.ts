namespace Quic{
    export class DataSource{
        _data:{[index:string]:any};
        constructor(dataOrCfg:any){
            this._data = dataOrCfg as {[index:string]:any};
        }
        data(value?:{[index:string]:any}){
            if(value===undefined) return this._data||(this._data={});
            this._data = value|| {};
        }
        total=():number=>this._data.length;
        
        static create(data?:any):DataSource{
            if(data instanceof DataSource) return data as DataSource;
            return new DataSource(data);
        }
    }
    
    export interface DataFieldOpts {
        //字段名
        name?:string;
        // 数据类型 默认是string
        dataType?:string;
        // 数据映射路径
        dataPath?:string;
       
        // 验证规则集
        validations?:{[index:string]:Validator};
    }
    
    export class DataField{
        name:string;
        dataType:string;
        dataPath:string;
        validations:{[index:string]:any};
        _T:(key:string)=>string;
        _accessorFactory:DataAccessorFactory;
        validate : (value:any)=>{[validType:string]:string};
        constructor(opts?:DataFieldOpts){
            if(opts)this.setOpts(opts);
            this.validate = this.dataValidate;
        }
        setOpts(opts:DataFieldOpts):DataField{
            if(opts.name){
                if(this.name && this.name!=opts.name) throw new Error("Cannot change DataField.name");
            }else{
                if(!this.name) throw new Error("name is required for DataField");
                this.name = opts.name;
            }
            this.dataType = opts.dataType||"string";
            let oldDataPath = this.dataPath;
            this.dataPath = opts.dataPath?opts.dataPath.replace(trimReg,""):this.name;
            this.validations = opts.validations;
            if(oldDataPath!=this.dataPath) {
                this.value=function(data:{[index:string]:any},val?:any):any{
                    this.value = (this._accessorFactory|| DataAccessorFactory.instance).cached(this.dataPath);
                    return this.value(data,val);
                }
                this.dataValue=function(data:{[index:string]:any},val?:any):any{
                    this.dataValue = (this._accessorFactory|| DataAccessorFactory.instance).cached(this.dataPath);
                    return this.dataValue(data,val);
                }
            }
            return this;
        }
        value(data:{[index:string]:any},val?:any):any{
            this.value = DataAccessorFactory.create(this.dataPath);
            return this.value(data,val);
        }
        dataValue(data:{[index:string]:any},val?:any):any{
            this.dataValue = (this._accessorFactory|| DataAccessorFactory.instance).cached(this.dataPath);
            return this.dataValue(data,val);
        }
        validationInfos(){
            let msgs :{[index:string]:string}= {};
            for(var validType in this.validations){
                let validator:Validator = validators[validType];
                if(validator){
                    msgs[validType] = validator(null,undefined,this.validations[validType]);
                }
            }
            return msgs;
        }
        
        
        dataValidate(value:any):{[validType:string]:string}{
            let validations = this.validations;
            if(!validations) { return ;}
            let hasError = false;let validError :string;
            let result :{[index:string]:string}={};
            //let value = this.value(data);
            let required = validations["required"];
            let dataValidType = this.dataType || "length";
            if(required){
                let val = (value||"").replace(trimReg,"");
                if(!val) {
                    hasError = true;
                    result["required"] = this._T("required");
                    return result;
                }
            }
            let validator:Validator = validators[dataValidType];
            let validParameter :any = validations[dataValidType];
            
            if(validator){
                if(validError = validator(this,value,validParameter)){
                    result[dataValidType] = validError;
                    hasError=true;
                }
            }

            for(var validType in validations){
                if(validType==="required" || validType===dataValidType) continue;
                validator = validators[validType];
                if(!validator)continue;
                validParameter = validations[validType];
                if(validError = validator(this,value,validParameter)){
                    result[validType] = validError;
                    hasError= true;
                }
            }
            return (hasError)?result:null; 
        }
        
        
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
            
            let last_propname = paths.shift().replace(trimReg,"");
            if(!last_propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            let codes = {
                path:"data",
                getter_code:"",
                setter_code:""
            };
            for(let i =0,j=paths.length;i<j;i++){
                let propname = paths[i].replace(trimReg,"");
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
    export function format(text:string,data?:any){
        if(!data)return text;
    }
    export interface Validator{
        (field:DataField,value:any,parameter:any):string;
    }
    let validators:{[validType:string]:Validator}  ={};
    validators["length"]=(field:DataField,value:any,parameter:any):string=>{
        parameter ||(parameter={});
        let message:string = "";
        let len = ((value===undefined||value===null)?"":value).length;
        if(parameter.min && (!field || parameter.min>len)){
            if(parameter.max && (!field || parameter.max<len)){
                message = field._T("length should be more than {min}, and less than {min}")
                    .replace("{min}",parameter.min)
                    .replace("{max}",parameter.max);
            }else{
                message = field._T("length should be more than {min}")
                    .replace("{min}",parameter.min);
            }
        }else {
            if(parameter.max  && (!field || parameter.max<len)){
                message = field._T("length should be less than {max}")
                    .replace("{max}",parameter.max);
            }
        }
        return message;
    }
    validators["int"]=(field:DataField,value:any,parameter:any):string=>{
        parameter ||(parameter={});
        let message:string = "";
        let val:number;
        if(!field){
            message = field._T("must be integer");
        }else{
            val = parseInt(value);
            if(isNaN(val)) return field._T("must be integer");
        }
        if(parameter.min && (!field || parameter.min>val)){
            if(parameter.max && (!field || parameter.max<val)){
                message += (message?"":"\n") + field._T("value should be more than {min}, and less than {min}")
                    .replace("{min}",parameter.min)
                    .replace("{max}",parameter.max);
            }else{
                message += (message?"":"\n") +field._T("value should be more than {min}")
                    .replace("{min}",parameter.min);
            }
        }else {
            if(parameter.max  && (!field || parameter.max<val)){
                message += (message?"":"\n") +field._T("value should be less than {max}")
                    .replace("{max}",parameter.max);
            }
        }
        
        return message;
    }
    validators["decimal"]=(field:DataField,value:any,parameter:any):string=>{
        parameter ||(parameter={});
        let message:string = "";
        let val:number;
        if(!field){
            message = field._T("must be decimal");
        }else{
            val = parseInt(value);
            if(isNaN(val)) return field._T("must be decimal");
        }
        let match = val.toString().match(/[+\-]?(\d+)(?".(\d+))\d/g);
        if(parameter.ipart && (!field || parameter.ipart<match[1].length)){
            message += (message?"":"\n") +field._T("integer part should be less than {ipart}")
            .replace("{ipart}",parameter.ipart);
            if(field) return message;
        }
        if(parameter.fpart && (!field || !match[2] || parameter.fpart<match[2].length)){
            message += (message?"":"\n") +field._T("float part should be less than {fpart}")
            .replace("{fpart}",parameter.fpart);
            if(field) return message;
        }
        if(parameter.min && (!field || parameter.min>val)){
            if(parameter.max && (!field || parameter.max<val)){
                message += (message?"":"\n") + field._T("value should be more than {min}, and less than {min}")
                    .replace("{min}",parameter.min)
                    .replace("{max}",parameter.max);
            }else{
                message += (message?"":"\n") +field._T("value should be more than {min}")
                    .replace("{min}",parameter.min);
            }
        }else {
            if(parameter.max  && (!field || parameter.max<val)){
                message += (message?"":"\n") +field._T("value should be less than {max}")
                    .replace("{max}",parameter.max);
            }
        }
        
        return message;
    }
    validators["email"]=(field:DataField,value:any,parameter:any):string=>{
        if(!field) return field._T("must be email address format");
        let emailReg :RegExp = /^\s*[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?\s*$/i;
        if(value===undefined || value===null) return null;
        if(!emailReg.test(value)) return field._T("invalid email address");
        return null;
    }
    //
    validators["url"] = (field:DataField,value:any,parameter:any):string=>{
        if(!field) return field._T("must be url address format");
        let urlReg :RegExp = /^\s*(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
        if(value===undefined || value===null) return null;
        if(!urlReg.test(value)) return field._T("invalid url address");
        return null;
    }
    validators["regex"] = (field:DataField,value:any,parameter:any):string=>{
        if(!field) return field._T("must be correct format");
        if(!parameter){

        }
        let reg :RegExp = new RegExp(parameter);
        if(value===undefined || value===null) return null;
        if(!reg.test(value)) return field._T("invalid format");
        return null;
    }
    validators["remote"] = (field:DataField,value:any,parameter:any):string=>{
        if(!parameter) parameter={};
        if(typeof parameter==="string") parameter = {url:parameter};
        if(!field) {
            if(parameter.message) return field._T(parameter.message);
        }
        throw new Error("Not implement");
    }
    


    
    let arrReg =/(?:\[\d+\])+$/g;
    let trimReg = /(^\s+)|(\s+$)/g;
    
    
    function buildPropCodes(propname:string,dataPath,codes:any,isLast?:boolean){
        if(!propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        let match = arrReg.exec(propname);
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

}