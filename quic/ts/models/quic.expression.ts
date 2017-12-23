

namespace Quic{
    export namespace Models{
        
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
            schema?:ISchema;
            text?:string;
            root?:ISchema;
            isDataPath?:boolean;
            deps?:Array<ISchema>;
        }
        export class Expression{
            type:ExpressionTypes;
            text:string;
            genAccess:(rootSchema:ISchema)=>IAccess;

            protected constructor(type:ExpressionTypes,text:string){
                this.type = type;
                this.text = text;
            }
            static parse(text:string):Expression{
                let exprs = new ExpressionParser(text).exprs;
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
            }
            text:string;
        }
        export class MemberAccessExpression extends Expression{
            members:Array<IMember>;
            constructor(text:string){
                super(ExpressionTypes.datapath,text);
                this.members = new MemberAccessParser(text).members;
            }
        }
        let jsKeywords = ["if","var","switch","case","for","return","with"];
        export class ComputedExpression extends Expression{
            paths:Array<MemberAccessExpression>;
            path:MemberAccessExpression;
            constructor(text:string){
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
                    this.paths.push(new MemberAccessExpression(path)); 
                }
                if(path && path.length===text.length-3){
                    this.path = this.paths[0];
                }                
                let code = "try{\n\twith($__DATA__){\n\t\treturn "+text+"\t}\n}"
                +"catch($__EXCEPTION__){\n\treturn $__EXCEPTION__;\n}\n";
                
            }
            
        }
        export class MixedExpression extends Expression{
            constructor(text:string,exprs:Array<Expression>){
                super(ExpressionTypes.mixed,text);
                this.exprs = exprs;
                if(exprs.length===1) {
                    this.expr = exprs[0];
                }
                
            }
            expr:Expression;
            exprs:Array<Expression>;

        }
        function makeMixedAccess(expr:MixedExpression,root:ISchema){
            let accesses:Array<IAccess>=[];
            let deps :Array<ISchema>=[];
            for(let i in expr.exprs){
                let access = expr.exprs[i].genAccess(root);
                accesses.push(access);
                let subdeps = access.deps;
                if(subdeps){
                    for(let m in subdeps){
                        let subdep = subdeps[m];
                        for(let v in deps) {if(deps[v]===subdep){subdep=null;}}
                        if(subdep){
                            deps.push(subdep);
                        } 

                    }
                }
            }
            let access:IAccess = (data:any,value?:any,evt?:any)=>{
                if(value===undefined) {
                    let rs = [];
                    for(let i in accesses){
                        let part = accesses[i].call(this,data);
                        if(part!==undefined && part!==null)rs.push(part);
                    }
                    return rs.join("");
                }
                for(let i in accesses){
                    accesses[i].call(this,data,value,evt);
                }
                return this;
            };
            access.deps = deps;
            return access;
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
                        this.exprs.push(new ComputedExpression(text.substring(this.lastTokenAt+1,at)));
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
        export let ExpressionParser = function(text:string){
            this.exprs =[];
            this.braceCount=0;
            this.lastTokenAt=-1;
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
                    if(this.onProp)this.onProp(match[1],false);
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
                    if(this.onProp)this.onProp(match[1],true);
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
        export let MemberAccessParser = function(text:string){
            this.members =[];
            this.lastTokenAt=-1;
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