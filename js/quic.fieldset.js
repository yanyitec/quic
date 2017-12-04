/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.field.ts" />
var Quic;
(function (Quic) {
    var Fieldset = /** @class */ (function () {
        function Fieldset(quic, opts) {
            this.defs = this.defs = opts;
            this.quic = quic;
            this.accessFactory = quic.accessFactory;
            var fields = this.fields = {};
            for (var n in opts.fields) {
                var fieldDefs = opts.fields[n];
                if (!fieldDefs.name)
                    fieldDefs.name = n;
                fields[fieldDefs.name] = new Quic.Field(this, fieldDefs);
            }
        }
        //多语言文本处理
        Fieldset.prototype._T = function (text, mustReturn) {
            return;
            /*
            let txt = this.langs[text];
            if(txt===undefined) {
                if(this.localization) txt = this.localization._T(text,mustReturn);
            }
            if(txt===undefined && this.langs!==langs) txt = langs[text];
            return (txt===null || txt===undefined) && mustReturn===true?"":(text===null|| text===undefined?"":text.toString());
            */
        };
        Fieldset.prototype.fieldValue = function (fieldOpts, fieldElement, data, value) {
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
        };
        return Fieldset;
    }());
    Quic.Fieldset = Fieldset;
})(Quic || (Quic = {}));
