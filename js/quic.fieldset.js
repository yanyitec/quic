/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.field.ts" />
var Quic;
(function (Quic) {
    class Fieldset {
        constructor(module, opts) {
            this.defs = this.defs = opts;
            this.module = module;
            this.accessFactory = module.accessFactory;
            let fields = this.fields = {};
            for (var n in opts.fields) {
                let fieldDefs = opts.fields[n];
                if (!fieldDefs.name)
                    fieldDefs.name = n;
                fields[fieldDefs.name] = new Quic.Field(this, fieldDefs);
            }
        }
        //多语言文本处理
        _T(text, mustReturn) {
            return;
            /*
            let txt = this.langs[text];
            if(txt===undefined) {
                if(this.localization) txt = this.localization._T(text,mustReturn);
            }
            if(txt===undefined && this.langs!==langs) txt = langs[text];
            return (txt===null || txt===undefined) && mustReturn===true?"":(text===null|| text===undefined?"":text.toString());
            */
        }
        fieldValue(fieldOpts, fieldElement, data, value) {
            /*
            let field :Field;
            let accessor :(data:{[index:string]:any},value?:any)=>any;;
            if(fieldOpts.mappath&& fieldOpts.mappath!==field.name){
                accessor = this.accessorFactory.cached(fieldOpts.mappath);
            }
            if(value===undefined){
                if(!fieldElement){
                    //从data取值
                    return data?(accessor?accessor(data):data[fieldOpts.name]):undefined;
                }else {
                    //从element中获取
                    value = field.viewRenderer.getValue(field);
                    if(data){
                        if(accessor) accessor(data,value); else data[fieldOpts.name] = value;
                    }
                    return value;
                }
            }else {
                if(fieldElement) field.viewRenderer.setValue(field,value);
                if(data) {if(accessor) accessor(data,value); else data[fieldOpts.name] = value;}
                return this;
            }*/
        }
    }
    Quic.Fieldset = Fieldset;
})(Quic || (Quic = {}));
