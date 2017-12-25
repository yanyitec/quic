

namespace Quic{
    export namespace Models{
        
        export enum ExpressionTypes{
            const,
            computed,
            datapath,
            mixed
        }
        export interface AccessOpts{
            get_super:(data:any)=>any;
            get_root:(data:any)=>any;
        }
        
        export class Expression{
            type:ExpressionTypes;
            text:string;

            protected constructor(type:ExpressionTypes,text:string){
                this.type = type;
                this.text = text;
            }
            gothrough(onProp:(name:string,isArr:boolean,text:string)=>void){
                throw new Error("Invalid Operation");
            }
            getValue(data:any,accessOpts?:AccessOpts):any{
                throw new Error("Invalid Operation");
            }
            getCode(asValue?:boolean):string{
                throw new Error("Invalid Operation");
            }
            static parse(text:string,onProp?:(name:string,isArr:boolean,text:string)=>void):Expression{
                let expr = new MixedExpression(text,onProp);
                if(expr.expr){
                    if((expr.expr as ComputedExpression).path){
                        return (expr.expr as ComputedExpression).path;
                    }else {
                        return expr.expr;
                    }
                }
                return expr;
            }
        }
        class ConstExpression extends Expression{
            constructor(constText:string){
                super(ExpressionTypes.const,constText);
            }
            getValue(data:any):any{
                return this.text;
            }
            getCode(asValue?:boolean):string{
                return '"' + this.text.replace(/\\/g,"\\\\").replace(/"/g,"\\\"").replace(/\n/g,"\\\n") + '"';
            }
            text:string;
        }
        (Expression as any).ConstExpression = ConstExpression;

        export class MemberAccessExpression extends Expression{
            member:IMember;
            members:Array<IMember>;
            constructor(text:string,onProp?:(name:string,isArr:boolean,expr:Expression)=>void){
                super(ExpressionTypes.datapath,text);
                this.members = new MemberAccessParser(text,onProp).members;
                if(this.members.length==0) this.member = this.members[0];
                
            }
            gothrough(onProp:(name:string,isArr:boolean,text:string)=>void){
                if(this.member){
                    onProp(this.member.name,this.member.isIndex,this.text);
                }else {
                    for(let i in this.members){
                        let member  = this.members[i];
                        onProp(member.name,member.isIndex,this.text);
                    }
                }
            }
            getValue(data:any,accessOpts?:AccessOpts):any{
                let code:string;
                if(this.member){
                    code = "return " + this.getCode()+";";
                    this.getValue = new Function("$__DATA__",code) as any;
                }else {
                    code = this.getCode();
                    this.getValue = new Function("$__DATA__",code) as any;                    
                }
                return this.getValue(data,accessOpts);
            }
            getCode(asValue?:boolean):string{
                let code = "";
                if(this.member){
                    code = "$__DATA__[";
                    if(this.member.isIndex) code += this.member.name;
                    else code += '"' + this.member.name +'"';
                    code = "]";
                    if(!asValue) code += "return " + code + ";\n";
                }else {
                    for(let i in this.members){
                        let member:IMember = this.members[i];
                        if(member.isIndex){
                            if(!member.name) throw new Error("this expression cannot call getValue:" + this.text);
                            code += "$__DATA__ = $__DATA__[" + member.name + "]";
                            code += "if(!$__DATA__)return $__DATA__;\n";
                        }else {
                            if(!member.name) throw new Error("this expression cannot call getValue:" + this.text);
                            code += "$__DATA__ = $__DATA__[\"" + member.name + "\"]";
                            code += "if(!$__DATA__)return $__DATA__;\n";
                        }
                    }
                    code += "return $__DATA__;\n";
                    if(asValue){
                        code = "(function($__DATA__)){" + code + "})($__DATA__)";
                    }
                }
                return code;
            }
            
        }
        (Expression as any).MemberAccessExpression = MemberAccessExpression;
        let jsKeywords = ["if","while","var","switch","case","for","in","return","with","function","continue","break"];
        
        export class ComputedExpression extends Expression{
            paths:Array<MemberAccessExpression>;
            path:MemberAccessExpression;
            constructor(text:string,onProp ? :(name:string,isArr:boolean,expr:Expression)=>void){
                super(ExpressionTypes.computed,text);
                let match:RegExpMatchArray;let path:string;
                pathRegx.lastIndex=0;
                while(match=pathRegx.exec(text)){
                    path = match[0];
                    if(!this.paths) {this.paths=[];}
                    let isKeyword = false;
                    for(let i=0,j=jsKeywords.length;i<j;i++){
                        if(jsKeywords[i] ===path){isKeyword=true;break;} 
                    }
                    if(isKeyword){continue;}
                    this.paths.push(new MemberAccessExpression(path,onProp)); 
                }
                if(path && path.length===text.length){
                    this.path = this.paths[0];
                }                
                
                
            }
            gothrough(onProp:(name:string,isArr:boolean,text:string)=>void){
                if(this.path){
                    this.path.gothrough(onProp);
                }else {
                    for(let i in this.paths){
                        let expr = this.paths[i];
                        expr.gothrough(onProp);
                    }
                }
            }

            getValue(data:any):any{
                if(this.path){
                    let result = this.path.getValue(data);
                    this.getValue = this.path.getValue;
                    return result;
                }else {
                    let code = this.getCode();
                    this.getValue = new Function("$__DATA__" ,code) as any;
                    return this.getValue(data);
                }
            }
            getCode(asValue?:boolean):string{
                if(this.path) return this.path.getCode(asValue);
                let code = "with($__DATA__){ return \n" +this.text + ";\n}";
                if(asValue){
                    code = "(function($__DATA__){"+code+"})($__DATA)";
                }
                return code;
            }

        }
        (Expression as any).ComputedExpression = ComputedExpression;

        export class MixedExpression extends Expression{
            constructor(text:string,onProp:(name:string,isArr:boolean,text:string)=>void){
                super(ExpressionTypes.mixed,text);
                let exprs = new ExpressionParser(text,onProp).exprs;
                this.exprs = exprs;
                if(exprs.length===1) {
                    this.expr = exprs[0];
                }
            }
            gothrough(onProp:(name:string,isArr:boolean,text:string)=>void){
                if(this.expr){
                    this.expr.gothrough(onProp);
                }else {
                    for(let i in this.exprs){
                        let ex:Expression = this.exprs[i] as Expression;
                        if(!(ex instanceof ConstExpression)){
                            (ex as Expression).gothrough(onProp);
                        }
                    }
                }
            }
            getValue(data:any):any{
                if(this.expr){
                    let value = this.expr.getValue(data);
                    this.getValue = this.expr.getValue;
                    return value;
                }else {
                    let code = this.getCode();
                    this.getValue = new Function("$__DATA__",code) as any;
                    return this.getValue(data);
                }
            }
            getCode(asValue?:boolean):any{
                if(this.expr){
                    return this.expr.getCode(asValue);
                }else {
                    let code = "var $__RESULT__=\"\";\n";
                    for(let i in this.exprs){
                        code += "$__RESULT__ +=" + this.exprs[i].getValue(true)+";\n";
                    }
                    code += "return $__DATA__;";
                    if(asValue){
                        code ="(function($__DATA__){"+code+"})($__DATA__)"
                    }
                    return code;
                }
            }
            expr:Expression;
            exprs:Array<Expression>;

        }
        (Expression as any).MixedExpression = MixedExpression;        
        
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
        export interface IParser{
            lastToken:string;
            lastTokenAt:number;
            inString:boolean;
        }
        export interface IMember{
            name:string;
            isIndex?:boolean;
        }
        
        export function expressionReader(text:string,parser:IParser){
            let offset :number ;
            let line :number;
            let handler:Function;
            for(let at=0,len=text.length;at<len;at++){
                let char = text[at];
                offset++;
                if(char==="\n"){
                    if(this.inString) throw new InvalidExpression("Carrage cannot be in string",text,at,line,offset)
                    line++;
                    offset=0;
                }
                handler = (<any>parser)[char] as Function;
                if(handler){
                    if( handler.call(parser,text,at,line,offset)){
                        parser.lastToken = char;
                        parser.lastTokenAt = at;
                    }
                }
            }
            handler=(<any>parser)[""] as Function;
            if(handler) {
                handler.call(parser,text,text.length,line,offset);
            }

        } 
        let expressionParser = {
            "$":function(text:string,at:number,line:number,offset:number){
                //在字符串中间的跳过,在computed表达式中间的跳过
                if(this.inString || this.inComputed) {return;}
                if(text[at+1]==="{"){
                    let constText = text.substring(this.lastTokenAt+1,at);
                    if(constText)this.exprs.push(new ConstExpression(constText));
                    return true;
                }
                
            },
            "{":function(text:string,at:number,line:number,offset:number){
                //在字符串中间/在表达式中间，跳过
                if(this.inString ) {return;}
                if(this.inComputed){ this.braceCount++; return;}
                if(this.lastToken==="$" && this.lastTokenAt===at-1){
                    this.inComputed = true;
                    this.braceCount=1;
                    return true;
                }
            },
            "}":function(text:string,at:number,line:number,offset:number){
                //在字符串中间/在表达式中间，跳过
                if(this.inString ) {return;}
                if(this.inComputed){
                    if(--this.braceCount==0){
                        this.exprs.push(new ComputedExpression(text.substring(this.lastTokenAt+1,at),this.onProp));
                        this.inComputed=false;
                        return true;
                    }
                }
            },
            "'":function(text:string,at:number,line:number,offset:number){
                if(this.inString==='"') {return;}
                if(this.inString==="'"){
                    if(text[at-1]==="\\"){return;}
                    else {
                        this.inString = undefined;return ;
                    }
                }
                if(this.inComputed){
                    this.inString="'";return ;
                }
            },
            '"':function(text:string,at:number,line:number,offset:number){
                if(this.inString==="'") {return;}
                if(this.inString==='"'){
                    if(text[at-1]==="\\"){return;}
                    else {
                        this.inString = undefined;return;
                    }
                }
                if(this.inComputed){
                    this.inString='"';return;
                }
            },
            "":function(text:string,at:number,line:number,offset:number){
                if(this.inComputed){
                    throw new InvalidExpression("JS Expression is not complete before END",text,text.length,line,offset);
                }
                if(this.lastTokenAt<text.length-1){
                    this.exprs.push(new ConstExpression(text.substring(this.lastTokenAt+1)));
                }
                return true;
            }
        }
        export let ExpressionParser = function(text:string,onProp?:(name:string,isArr:boolean,text:string)=>void){
            this.exprs =[];
            this.braceCount=0;
            this.lastTokenAt=-1;
            this.onProp = onProp;
            expressionReader(text,this);
        }
        ExpressionParser.prototype = expressionParser;

        let memberAccess = {
            "meetProp":function(text:string,at:number,allowEmpty?:boolean){
                let prop = text.substring(this.lastTokenAt+1,at);
                if(/^\s*$/g.test(prop)){
                    if(allowEmpty){
                        return true;
                    }else{
                        throw new Error("Invalid MemberAccess expression:" + text);
                    } 
                }
                propRegex.lastIndex=0;
                let match = propRegex.exec(prop);
                if(match){
                    this.members.push({name:match[1],isIndex:false});
                    if(this.onProp)this.onProp(match[1],false,text);
                    return true;
                } 
                
                throw new Error("Invalid MemberAccess expression:" + text);
            },
            "meetIndex":function(text:string,at:number){
                let prop = text.substring(this.lastTokenAt+1,at);
                numberRegex.lastIndex = 0;
                let match = numberRegex.exec(prop);
                if(match){
                    this.members.push({name:match[1],isIndex:true});
                    if(this.onProp)this.onProp(match[1],true,text);
                    return true;
                } 
                throw new Error("Invalid MemberAccess expression:" + text);
            },
            ".":function(text:string,at:number,line:number,offset:number){
                if(this.lastToken==="]"){return true;}
                return this.meetProp(text,at);
            },
            "[":function(text:string,at:number,line:number,offset:number){
                if(this.lastToken==="." || this.lastToken===undefined){
                    return this.meetProp(text,at,this.lastToken===undefined);
                }else {
                    if(this.lastToken==="[") throw new Error("Invalid MemberAccess expression:" +text);
                    let word = text.substring(this.lastTokenAt+1,at);
                    if(!/^\s*$/g.test(word)){
                        throw new Error("Invalid MemberAccess expression:" +text);
                    }
                    return true;
                }
            },
            "]":function(text:string,at:number,line:number,offset:number){
                if(this.lastToken!=='['){
                    throw new Error("Invalid MemberAccess expression:" +text);
                }
                return this.meetIndex(text,at);
            },
            "":function(text:string,at:number,line:number,offset:number){
                if(this.lastToken==='['){
                    throw new Error("Invalid MemberAccess expression:" +text);
                }
                return this.meetProp(text,text.length,true);
            }
        }
        export let MemberAccessParser = function(text:string,onProp?:any){
            this.members =[];
            this.lastTokenAt=-1;
            this.onProp = onProp;
            expressionReader(text,this);
        }
        MemberAccessParser.prototype = memberAccess;

        let propRegex = /^\s*([a-zA-Z_\$][a-zA-Z0-9_\$]*)\s*$/g;
        let numberRegex = /\s*(\d*)\s*/;
        let computedRegx = /\$\{[^\}]+\}/g;
        let arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
        let propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
        let regt =   "(?:"+propSectionRegt+")(?:"+arrSectionRegt + "|(?:." +propSectionRegt+"))*";
        let pathRegx :RegExp = new RegExp(regt,"g");
    }
    
}
exports.Expression = Quic.Models.Expression;
exports.ExpressionParser = Quic.Models.ExpressionParser;
exports.MemberAccessParser = Quic.Models.MemberAccessParser;