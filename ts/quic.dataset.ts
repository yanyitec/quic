/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.datafield.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />

namespace Quic{
    export interface DatasetOpts extends FieldOpts{
        fields:{[index:string]:FieldOpts};
    }
    export interface IDataset extends DatasetOpts{
        opts:DatasetOpts;
    }
    export class Dataset extends Field  implements DatasetOpts,IViewset{
        fields:{[index:string]:Field};
        constructor(container:IViewset,opts:DatasetOpts){
            super(container,opts);
            this.opts = opts;
            let fields:{[index:string]:Field} = this.fields = {};
            for(var n in opts.fields){
                let fieldOpts = opts.fields[n];
                if(!fieldOpts.name)fieldOpts.name = n;
                fields[fieldOpts.name] = new Field(this,fieldOpts);
            }
        }
        //数据访问器
        accessorFactory:DataAccessorFactory;
        
        //多语言文本处理
        _T(text:string,mustReturn?:boolean){
            let txt = langs[text];
            if(txt===null || txt===undefined){
                if(mustReturn===true) return text;
            }
            return txt;
            
        }

       

        fieldValue(fieldOpts:FieldOpts,fieldElement:HTMLElement,data:any,value?:any):any{
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
                    value = field.builder.getViewValue(field,fieldElement); 
                    if(data){
                        if(accessor) accessor(data,value); else data[fieldOpts.name] = value;
                    }
                    return value;
                }
            }else {
                if(fieldElement) field.builder.setViewValue(field,fieldElement,value);
                if(data) {if(accessor) accessor(data,value); else data[fieldOpts.name] = value;}
                return this;
            }
        }
    }
}