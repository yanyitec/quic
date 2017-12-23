/// <reference path="../base/quic.promise.ts" />
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.transport.ts" />
/// <reference path="quic.schema.ts" />
namespace Quic{
    export namespace Data{
        export interface IExpression{
            (data:any,value:any,evtArgs?:any):any;
            text?:string;
            isComputed?:boolean;
            deps?:Array<ISchema>;
        }

        export interface IExpressionFactory{
            rootSchema:ISchema;
            getOrCreate(expr:string):IExpression;
        }
        export class ExpressionFactory{
            //accessFactory:IAccessFactory;
            rootSchema:ISchema;
            caches:{[index:string]:IExpression};
    
            constructor(rootSchema?:ISchema){
                this.caches = {};
                this.rootSchema = rootSchema || new Schema("$ROOT");
            }
            getOrCreate(text:string):IExpression{
                let expr = this.caches[text] || ExpressionFactory.create(text,this.rootSchema);
                return expr;
            }
            static default:IExpressionFactory = new ExpressionFactory();
            static getOrCreate(text:string):IExpression{
                return ExpressionFactory.default.getOrCreate(text);
            }
    
            static create(text:string,rootSchema:ISchema):any{
                let rs :RegExpExecArray;
                let mappathRs:RegExpExecArray;
                let deps :Array<ISchema> = [];
                let at:number = 0;
                let outerCode = "";
                let onlyMappathCount=0;
                let constText:string;
                let computedText:string;
                let code = "\tvar $__RESULT__='';var $__MID_RESULT__;\n";
                //查找text中${...}部分
                while(rs=computedRegx.exec(text)){
                    computedText = rs[0].substring(2,rs[0].length-1);
                    constText=text.substring(at,rs.index);
                    at += rs.index + rs[0].length;
                    if(constText!==""){
                        code += "\t\t$__RESULT__ +=\"" + constText.replace(/"/g,"\\\"") + "\";\n";
                    }
                    let mappath:string;
                    
                    while(mappathRs=regex.exec(computedText)){
                        mappath = mappathRs[0];
                        let schema = rootSchema.define(mappath);
                        if(mappath===computedText && computedText.length===text.length-3){
                            
                            let expr = function(data:any,value?:any,evtArgs?:any):any{
                                if(value===undefined){
                                    return schema.get_value(data);
                                }
                                if(value==="quic:undefined"){
                                    value=undefined;
                                }
                                schema.set_value(data,value,evtArgs);
                            };
                            (expr as IExpression).expression = text;

                        }
                        deps.push(schema);
                    }
                    if(mappath.length === computedText.length){
                        outerCode += "var $__SCHEMA__"+onlyMappathCount+"=$__ROOTSCHEMA__.define(\""+mappath+"\");\n";
                        code += "\t\t$__MID_RESULT__ = $__SCHEMA__" + (onlyMappathCount++) + "($__DATA__);\n";
                        code += `\t\tif($EMPTYERROR!=='quic:none-empty' || ($__MID_RESULT__!==undefined && $__MID_RESULT__!==null)) {$__RESULT__+=$__MID_RESULT__;}\n`;
                    }else {
                        code += `
            try{
                $__RESULT__ += (function($__DATA__){
                    with($__DATA__){
                        return ${computedText};
                    }
                })($__DATA__);
            }catch($__EXCEPTION__){
                    Quic.ctx.warn("expression error",$__EXCEPTION__);
                    $__RESULT__ += $EMPTYERROR==='quic:none-empty'?"":$__EXCEPTION__.toString();
            }\n`;
                    }
                }
                constText=text.substring(at);
                if(constText!==""){
                    code += "\t$__RESULT__ +=\"" + constText.replace(/"/g,"\\\"") + "\";\n";
                }
                
    
                code += "\treturn $__RESULT__;\n";
                let result :any;
                if(onlyMappathCount===0){
                    result = new Function("$__DATA__","$EMPTYERROR",code);
                }else {
                    outerCode +="return function($__DATA__,$EMPTYERROR){\n" + code + "};";
                    result = new Function("$__ROOTSCHEMA__",outerCode)(rootSchema);
                }
                result.deps = deps;
                result.expression = text;
                return result as IExpression;
            }
    
        }

        interface ParseOpts{
            text?:string;
            code?:string;
        }
        export enum ExpressionTypes{
            const,
            computed,
            datapath,
            mixed
        }
        export interface IAccess{
            (data:any,value?:any):any;
            type?:ExpressionTypes;
            expr?:Expression;
            text?:string;
            root?:ISchema;
            isDataPath?:boolean;
            deps?:Array<ISchema>;
        }
        class Expression{
            type:ExpressionTypes;
            text:string;
            genAccess:(rootSchema:ISchema)=>IAccess;

            protected constructor(type:ExpressionTypes,text:string){
                this.type = type;
                this.text = text;
            }
            static parse(text:string):Expression{
                let exprs = parseText(text);
                if(exprs.length==1){
                    let expr = exprs[0];
                    return (expr as ComputedExpression).path?(expr as ComputedExpression).path:expr;
                }
                return new MixedExpression(text,exprs);
            }
        }
        class ConstExpression extends Expression{
            constructor(constText:string){
                super(ExpressionTypes.const,constText);
                this.genAccess =(root:ISchema)=>{
                    let access:IAccess = (data)=>constText;
                    access.type = this.type;
                    access.text = constText;
                    access.expr = this;
                    access.root = root;
                    return access;
                }
            }
            text:string;
        }
        export class DataPathExpression extends Expression{
            constructor(text:string){
                super(ExpressionTypes.datapath,text);
                this.genAccess =(root:ISchema)=>{
                    let schema = root.define(text);
                    let access :IAccess =function(data:any,value?:any,evt?:any){
                        if(value===undefined){
                            return schema.get_value(data,value==="quic:fill-default");
                        }
                        if(value==="quic:undefined") {value=undefined;}
                        schema.set_value(data,value,evt);
                        return this;
                    };
                    access.type = this.type;
                    access.text = text;
                    access.expr = this;
                    access.root = root;
                    access.isDataPath = true;
                    return access;
                };
            }
            
            
        }
        export class ComputedExpression extends Expression{
            paths:Array<DataPathExpression>;
            path:DataPathExpression;
            constructor(text:string){
                super(ExpressionTypes.computed,text);
                let match:RegExpMatchArray;let path:string;
                while(match=pathRegx.exec(text)){
                    path = match[0];
                    if(!this.paths) {this.paths=[];}
                    this.paths.push(new DataPathExpression(path)); 
                }
                if(path && path.length===text.length-3){
                    this.path = this.paths[0];
                }                
                let code = "try{\n\twith($__DATA__){\n\t\treturn "+text+"\t}\n}"
                +"catch($__EXCEPTION__){\n\treturn $__EXCEPTION__;\n}\n";
                this.genAccess = (root:ISchema)=>{
                    let access:IAccess = new Function("$__DATA__",code) as any;
                    access.type = this.type;
                    access.text = text;
                    access.expr = this;
                    access.root = root;
                    if(this.paths){
                        let deps :Array<ISchema>=[];
                        for(let i in this.paths){
                            let path = this.paths[i];
                            deps.push(root.define(path.text));
                        }
                        access.deps=deps;
                    }
                    return access;
                }
            }
            
        }
        export class MixedExpression extends Expression{
            constructor(text:string,exprs:Array<Expression>){
                super(ExpressionTypes.mixed,text);
                this.exprs = exprs;
                if(exprs.length===1) {
                    this.expr = exprs[0];
                }
                this.genAccess = (root:ISchema)=>{
                    //if(this.expr) return (this.expr as any).path?(this.expr as DataPathExpression).genAccess(root):this.expr.genAccess(root);
                    let accesses:Array<IAccess>=[];
                    for(let i in this.exprs){
                        accesses.push(this.exprs[i].genAccess(root));
                    }
                    let access :IAccess = (data:any,value?:any,evt?:any)=>{
                        if(value===undefined) {
                            let rs = [];
                            for(let i in accesses){
                                rs.push(accesses[i].call(this,data));
                            }
                            return rs.join("");
                        }
                        for(let i in accesses){
                            accesses[i].call(this,data,value,evt);
                        }
                        return this;
                    };
                    access.type = this.type;
                    access.text = text;
                    access.expr = this;
                    access.root = root;
                    return access;
                };
            }
            expr:Expression;
            exprs:Array<Expression>;

        }
        class InvalidExpression extends Error{
            message :string;
            expression:string;
            at:number;
            line:number;
            offset:number;
            constructor(message,text,at,lineAt,offset){
                super(message + ":" + text);
                this.message = message;
                this.expression = text;
                this.line = lineAt;
                this.offset = offset;
            }
        }
        function parseText(text:string){
            let lastToken="}";
            let lastTokenAt=-1;
            let branceCount=0;
            let line = 1;
            let offset = 0;
            let inString:string=undefined;
            let exprs:Array<any>=[];
            for(let at=0,len=text.length;at<len;at++){
                let char = text[at];
                offset++;
                if(char==="$"){
                    //在字符串中间的跳过,在computed表达式中间的跳过
                    if(inString || lastToken==="{") {continue;}
                    lastToken = char;
                    lastTokenAt = at;
                }else if(char==="{"){
                    //在字符串中间，跳过
                    if(inString) {continue;}
                    if(lastToken==="}"){
                        exprs.push(new ConstExpression(text.substring(lastTokenAt+1,at-1)));
                        lastTokenAt = at;
                        continue;
                    }
                    //${ }开始
                    if(lastToken==="$" && lastTokenAt===at-1){
                        lastToken="{";
                        lastTokenAt=at;
                        continue;
                    }
                    //computed中间的{,计算个数，等待结束标记
                    if(lastToken==="{"){
                        branceCount++;
                        continue;
                    }
                }else if(char==="}"){
                    //在字符串中间，跳过
                    if(inString) {continue;}
                    if(lastToken==="{"){
                        if(branceCount===0){
                            exprs.push(new ComputedExpression(text.substring(lastTokenAt+1,at-1)));
                            lastToken="}";
                            lastTokenAt=at;
                            continue;
                        }else {
                            if(--branceCount<0) {throw new InvalidExpression("} has no matched {",text,at,line,offset);}
                        }
                    }
                }else if(char==="'"){
                    if(inString==='"') {continue;}
                    if(inString==="'"){
                        if(text[at-1]==="\\"){continue;}
                        else {
                            inString = undefined;continue;
                        }
                    }
                    if(lastToken==="{"){
                        inString="'";continue;
                    }
                }else if(char==='"'){
                    if(inString==="'") {continue;}
                    if(inString==='"'){
                        if(text[at-1]==="\\"){continue;}
                        else {
                            inString = undefined;continue;
                        }
                    }
                    if(lastToken==="{"){
                        inString='"';continue;
                    }
                }else if(char==="\n"){
                    line++;
                    offset=0;
                }
            }
            if(branceCount>0){
                throw new InvalidExpression("expect } before END",text,text.length,line,offset);
            }
            if(lastTokenAt<text.length-1){
                exprs.push(new ConstExpression(text.substring(lastTokenAt+1)));
            }
            return exprs;
        }
        let computedRegx = /\$\{[^\}]+\}/g;
        let arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
        let propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
        let regt =   "(?:"+arrSectionRegt + "|" + propSectionRegt+")(?:"+arrSectionRegt + "|(?:." +propSectionRegt+"))*";
        let regex:RegExp = new RegExp(regt,"g");
        let pathRegx :RegExp = new RegExp(regt,"g");
    }
    
}
exports.ExpressionFactory = Quic.Data.ExpressionFactory;