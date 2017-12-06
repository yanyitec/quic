declare var exports;
export class $$TestFailException extends Error{
    constructor(message?:string,value1?:any,value2?:any){
        super(message?message.replace(/\{0\}/g,value1).replace(/\{1\}/g,value2):"Test failed.");
    }
}


export class $$TEST{
    static log(msg:string){
        console.log(msg);
    }
    static assert(msg:string){
        if(console.assert)console.assert(false,msg);
        else console.error(msg);
    }
    static run(obj:any,msg?:string,tab?:string){
        tab || (tab="");
        if(msg)$$TEST.log(tab+msg);
        if(!obj)return;
        let t = typeof obj;
        if(t==="function") obj();
        if(t==="object"){
            let isArr = obj.length!==undefined && obj.push && obj.shift;
            tab = "\t" + tab;
            for(let i in obj){
                $$TEST.run(obj[i],i,tab);
            }
        }
    }
    value?:any;
    constructor(value:any){ this.value = value; }

    isNone(message?:string):$$TEST{
        
        if(this.value){
            throw new $$TestFailException(message||"expect:{0} is zero,empty,null,undefined",this.value);
        }
        return this;
    }
    isExists(message?:string):$$TEST{
        
        if(!this.value){
            throw new $$TestFailException(message||"expect:{0} is NOT zero,empty,null,undefined",this.value);
        }
        return this;
    }
    isEmpty(message?:string):$$TEST{
        
        if(this.value!==""){
            throw new $$TestFailException(message||"expect:{0} is empty string",this.value);
        }
        return this;
    }
    notEmpty(message?:string):$$TEST{
        
        if(this.value===""){
            throw new $$TestFailException(message||"expect:{0} is empty string",this.value);
        }
        return this;
    }
   
    isZero(message?:string):$$TEST{
        
        if(this.value!==0){
            throw new $$TestFailException(message||"expect:{0} is zero",this.value);
        }
        return this;
    }
    notZero(message?:string):$$TEST{
        
        if(this.value===0){
            throw new $$TestFailException(message||"expect:{0} is NOT zero",this.value);
        }
        return this;
    }
    
    isNull(message?:string):$$TEST{
        
        if(this.value!==null){
            throw new $$TestFailException(message||"expect:{0} is null",this.value);
        }
        return this;
    }
    notNull(message?:string):$$TEST{
        
        if(this.value===null){
            throw new $$TestFailException(message||"expect:{0} is NOT null",this.value);
        }
        return this;
    }
    isUndefined(message?:string):$$TEST{
        
        if(this.value!==undefined){
            throw new $$TestFailException(message||"expect:{0} is undefined",this.value);
        }
        return this;
    }
    notUndefined(message?:string):$$TEST{
        
        if(this.value===undefined){
            throw new $$TestFailException(message||"expect:{0} is defined",this.value);
        }
        return this;
    }
    hasValue(message?:string):$$TEST{
        
        if(this.value===undefined || this.value===null){
            throw new $$TestFailException(message||"expect:{0} has value",this.value);
        }
        return this;
    }
    noValue(message?:string):$$TEST{
        
        if(this.value!==undefined && this.value!==null){
            throw new $$TestFailException(message||"expect:{0} not value",this.value);
        }
        return this;
    }
    isObject(message?:string):$$TEST{
        
        if(typeof this.value!=="object"){
            throw new $$TestFailException(message||"expect:{0} is object",this.value);
        }
        return this;
    }
    notObject(message?:string):$$TEST{
        if(typeof this.value==="object"){
            throw new $$TestFailException(message||"expect:{0} is NOT Object",this.value);
        }
        return this;
    }
    isArray(message?:string):$$TEST{
        if(Object.prototype.toString.call(this.value)==="{object Array}"){
            throw new $$TestFailException(message||"expect:{0} is array",this.value);
        }
        return this;
    }
    notArray(message?:string):$$TEST{
        if(Object.prototype.toString.call(this.value)!=="{object Array}"){
            throw new $$TestFailException(message||"expect:{0} is array",this.value);
        }
        return this;
    }
    isString(message?:string):$$TEST{
        if(typeof this.value !=="string"){
            throw new $$TestFailException(message||"expect:{0} is string",this.value);
        }
        return this;
    }
    notString(message?:string):$$TEST{
        if(typeof this.value !=="string"){
            throw new $$TestFailException(message||"expect:{0} is string",this.value);
        }
        return this;
    }
    isBool(message?:string):$$TEST{
        if(typeof this.value !=="boolean"){
            throw new $$TestFailException(message||"expect:{0} is string",this.value);
        }
        return this;
    }
    notBool(message?:string):$$TEST{
        if(typeof this.value !=="string"){
            throw new $$TestFailException(message||"expect:{0} is string",this.value);
        }
        return this;
    }
    isNumber(message?:string):$$TEST{
        if(typeof this.value !=="number"){
            throw new $$TestFailException(message||"expect:{0} is string",this.value);
        }
        return this;
    }
    notNumber(message?:string):$$TEST{
        if(typeof this.value !=="number"){
            throw new $$TestFailException(message||"expect:{0} is string",this.value);
        }
        return this;
    }
    instanceOf(...tp:Array<Function>):$$TEST{
        for(var i=0,j=tp.length;i<j;i++){
            if(this.value instanceof tp[i])return this;
        }
        throw new $$TestFailException("type check failed.");
    }
    isEqual(other:any):$$TEST{
        if(this.value!=other){
            throw new $$TestFailException("expect:{0} == {1}",this.value,other);
        }
        return this;
    }
    notEqual(other:any):$$TEST{
        if(this.value==other){
            throw new $$TestFailException("expect:{0} != {1}",this.value,other);
        }
        return this;
    }

    isSame(other:any):$$TEST{
        if(this.value!==other){
            throw new $$TestFailException("expect:{0} === {1}",this.value,other);
        }
        return this;
    }
    notSame(other:any):$$TEST{
        if(this.value===other){
            throw new $$TestFailException("expect:{0} !== {1}",this.value,other);
        }
        return this;
    }
    greaterThan(other:any):$$TEST{
        if(this.value<=other){
            throw new $$TestFailException("expect:{0} > {1}",this.value,other);
        }
        return this;
    }
    lessThan(other:any):$$TEST{
        if(this.value>=other){
            throw new $$TestFailException("expect:{0} > {1}",this.value,other);
        }
        return this;
    }
    greaterThanOrEqual(other:any):$$TEST{
        if(this.value<other){
            throw new $$TestFailException("expect:{0} >= {1}",this.value,other);
        }
        return this;
    }
    lessThanOrEqual(other:any):$$TEST{
        if(this.value>other){
            throw new $$TestFailException("expect:{0} <= {1}",this.value,other);
        }
        return this;
    }
}
exports.$$TEST = $$TEST;

    