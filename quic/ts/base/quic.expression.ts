namespace Quic{
    export interface IExpression{
        (data:{[index:string]:any},noneToEmpty?:boolean):any;
        text?:string;
        deps?:Array<IDataAccess>;
    }
    export interface IExpressionFactory{
        accessFactory:IAccessFactory;
        getOrCreate(expr:string):IExpression;
    }
    export class ExpressionFactory{
        accessFactory:IAccessFactory;
        caches:{[index:string]:IExpression};
        constructor(accessFactory?:IAccessFactory){
            this.caches = {};
            this.accessFactory= accessFactory ;
            if(!this.accessFactory && AccessFactory){
                this.accessFactory = AccessFactory.default;
            }
        }
        getOrCreate(text:string):IExpression{
            let expr = this.caches[text] || ExpressionFactory.create(text,this.accessFactory);
            return expr;
        }
        static default:IExpressionFactory = new ExpressionFactory();
        static getOrCreate(text:string):IExpression{
            return ExpressionFactory.default.getOrCreate(text);
        }

        static create(text:string,accessFactory:IAccessFactory):any{
            let rs :RegExpExecArray;
            let mappathRs:RegExpExecArray;
            let deps :Array<IDataAccess> = [];
            let at:number = 0;
            let outerCode = "";
            let onlyMappathCount=0;
            let constText:string;
            let code = "\tvar $__RESULT__='';var $__MID_RESULT__;\n";
            while(rs=computedRegx.exec(text)){
                let computedText = rs[0].substring(2,rs[0].length-1);
                constText=text.substring(at,rs.index);
                at += rs.index + rs[0].length;
                if(constText!==""){
                    code += "\t\t$__RESULT__ +=\"" + constText.replace(/"/g,"\\\"") + "\";\n";
                }
                let mappath:string;
                while(mappathRs=regex.exec(computedText)){
                    mappath = mappathRs[0];
                    deps.push(accessFactory.getOrCreate(mappath));
                }
                if(mappath.length === computedText.length){
                    outerCode += "var $_ACCESSOR_"+onlyMappathCount+"=$__ACCESSFACTORY__.getOrCreate(\""+mappath+"\");\n";
                    code += "\t\t$__MID_RESULT__ = $_ACCESSOR_" + (onlyMappathCount++) + "($__DATA__);\n";
                    code += `\t\tif(!$EMPTYERROR || ($__MID_RESULT__!==undefined && $__MID_RESULT__!==null)) {$__RESULT__+=$__MID_RESULT__;}\n`;
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
                $__RESULT__ += $EMPTYERROR?"":$__EXCEPTION__.toString();
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
                result = new Function("$__ACCESSFACTORY__",outerCode)(accessFactory);
            }
            result.deps = deps;
            result.text = text;
            return result as IExpression;
        }

    }
    let computedRegx = /\$\{[^\}]+\}/g;
    let arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
    let propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
    let regt =   "(?:"+arrSectionRegt + "|" + propSectionRegt+")(?:"+arrSectionRegt + "|(?:." +propSectionRegt+"))*";
    let regex:RegExp = new RegExp(regt,"g");
}
exports.ExpressionFactory = Quic.ExpressionFactory;