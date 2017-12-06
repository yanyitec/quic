/// <reference path="quic.abstracts.ts" />
namespace Quic{
    

    export class Fieldset implements IFieldset,FieldsetOpts{
        quic:IQuic;
        fields:{[index:string]:IField};
        langs?:{[index:string]:string};
        opts:FieldsetOpts;
        defs:FieldsetDefs;
        //数据访问器
        accessFactory:IAccessFactory;
        

        constructor(quic:IQuic,opts:FieldsetOpts){
            this.defs = this.defs = opts;
            this.quic = quic;
            this.accessFactory = quic.accessFactory;
            
            let fields:{[index:string]:IField} = this.fields = {};
            for(var n in opts.fields){
                let fieldDefs= opts.fields[n];
                if(!fieldDefs.name)fieldDefs.name = n;
                fields[fieldDefs.name] = new Field(this,fieldDefs);
            }
        }
        
        
        //多语言文本处理
        _T(text:string,mustReturn?:boolean):string{return;
            /*
            let txt = this.langs[text];
            if(txt===undefined) {
                if(this.localization) txt = this.localization._T(text,mustReturn);
            }
            if(txt===undefined && this.langs!==langs) txt = langs[text];
            return (txt===null || txt===undefined) && mustReturn===true?"":(text===null|| text===undefined?"":text.toString());            
            */
        }

        
       

        fieldValue(fieldOpts:FieldOpts,fieldElement:HTMLElement,data:any,value?:any):any{
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
    
}