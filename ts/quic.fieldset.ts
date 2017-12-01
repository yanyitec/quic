/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.datafield.ts" />
/// <reference path="quic.dataset.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.viewset.ts" />
/// <reference path="quic.field.ts" />
namespace Quic{
    export interface FieldsetDefs {
        name?:string;
        fields:{[index:string]:FieldDefs};
    }
    export interface FieldsetOpts extends FieldsetDefs{
        accessorFactory?:AccessorFactory;
        langs?:{[index:string]:string}|boolean;        
    }

    export interface IFieldset extends  ILocalizable{
        opts:FieldsetOpts;
        //数据访问器
        accessorFactory:AccessorFactory;
        fieldValue(fieldOpts:FieldOpts,fieldElement:HTMLElement,data:any,value?:any):any;
    }

    export class Fieldset implements IFieldset,FieldsetOpts{
        fields:{[index:string]:IField};
        langs?:{[index:string]:string};
        opts:FieldsetOpts;
        defs:FieldsetDefs;
        localization:ILocalizable;
        viewBuilder:IViewBuilder;
        //数据访问器
        accessorFactory:AccessorFactory;
        

        constructor(localization:ILocalizable,opts:FieldsetOpts){
            this.defs = this.defs = opts;
            this.accessorFactory = opts.accessorFactory || new AccessorFactory();
            this.localization = localization;
            this.langs = (opts.langs as {[index:string]:string}) || langs;

            let fields:{[index:string]:IField} = this.fields = {};
            for(var n in opts.fields){
                let fieldDefs= opts.fields[n];
                if(!fieldDefs.name)fieldDefs.name = n;
                fields[fieldDefs.name] = new Field(this,fieldDefs);
            }
        }
        
        
        //多语言文本处理
        _T(text:string,mustReturn?:boolean):string{
            let txt = this.langs[text];
            if(txt===undefined) {
                if(this.localization) txt = this.localization._T(text,mustReturn);
            }
            if(txt===undefined && this.langs!==langs) txt = langs[text];
            return (txt===null || txt===undefined) && mustReturn===true?"":(text===null|| text===undefined?"":text.toString());            
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
                    value = field.viewBuilder.getViewValue(field,fieldElement); 
                    if(data){
                        if(accessor) accessor(data,value); else data[fieldOpts.name] = value;
                    }
                    return value;
                }
            }else {
                if(fieldElement) field.viewBuilder.setViewValue(field,fieldElement,value);
                if(data) {if(accessor) accessor(data,value); else data[fieldOpts.name] = value;}
                return this;
            }
        }
    }
    export interface FieldOptsCollectionOpts {
        includes?:string;
        excludes?:string | Array<string>;
        defaultPermssion:string;
    }


    
    export function parseFieldOptsCollection(Opts:FieldOptsCollectionOpts):{[index:string]:FieldOpts}{
        let destFieldOptsSet = this.fields = {};
        let excludes:Array<string> = 
            Opts.excludes
                ?(typeof Opts.excludes ==="string"?Opts.excludes.split(","):Opts.excludes)
                :undefined;
        let includes :{[index:string]:FieldOpts};
        //id，base[name:readonly,password:editable],gender:hidden
        includes={};
        let groupname;
        let groupCount=0;
        let includeExprs = Opts.includes.split(",");
        for(let i =0 ,j= includeExprs.length;i<j;i++){
            let expr:string = includeExprs[i].replace(trimRegx,"");
            let name:string;let permission :string;
            if(!expr) continue;
            let at:number = expr.indexOf("[");
            let startAt:number = 0;
            if(at>=0){
                if(groupname!==undefined)throw new Error(`invalid includes expression:${Opts.includes}. meet[, but the previous [ is not close. lack of ]?`);
                groupname = expr.substr(0,at);startAt = at+1;
                groupCount++;
            }else at = 0;
            at = expr.indexOf(":",startAt);
            if(at>=0){
                name = expr.substr(0,at).replace(trimRegx,"");
                permission = expr.substr(at+1).replace(trimRegx,"");
                if(!permission) throw new Error(`invalid includes expression:${Opts.includes}. meet :, but permission is empty.`);;
            } else name = expr.substr(startAt).replace(trimRegx,"");
            let endGroup:boolean = false;
            if(name[name.length-1]==="]"){
                if(!groupname)throw new Error(`invalid includes expression:${Opts.includes}. meet ], but not matched [. lack of [?`);;
                endGroup = true;
                name = name.substr(0,name.length-1);
            }
            if(!name)throw new Error(`invalid includes expression:${Opts.includes}. Some name is empty.`);
            if(excludes && array_index(excludes,name)>=0) continue;
            
            let fieldOpts :FieldOpts={name:name};
            fieldOpts.permission = permission|| Opts.defaultPermssion;
            if(groupname!==undefined){
                if(groupname=="") groupname = ' ' + groupCount;
                fieldOpts.group = groupname;
            }
            destFieldOptsSet[name] = fieldOpts;
        }
        return destFieldOptsSet;
    }
}