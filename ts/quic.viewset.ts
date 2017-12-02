/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
/// <reference path="quic.fieldset.ts" />

namespace Quic{
    export interface ViewsetOpts extends ViewOpts{
        fieldsetName?:string;
        //要包含的域s表达式或域s配置
        includes?:string | {[fieldname:string]:FieldOpts};
        //要排除的域的名字
        excludes?:string | Array<string>;
        //初始化用到的数据
        initData?:{[index:string]:any};

        initing?(container:IViewset,fieldset:IFieldset,opts:ViewsetOpts);
    }
    
    
    export interface IViewset extends IView,ViewsetOpts{
        opts:ViewsetOpts;
        fieldset:IFieldset;
        views:{[index:string]:IView};      
        currentData:  {[index:string]:any};
    }

    export class Viewset extends View implements IViewset{
       
        //字段集
        fieldset:IFieldset;
        

        views:{[index:string]:IView};

        //要包含的域s表达式或域s配置
        includes?:{[fieldname:string]:FieldOpts};
        //要排除的域的名字
        excludes?:Array<string>;
        
        
        initData:{[index:string]:any};
        currentData:  {[index:string]:any};

        constructor(container:IViewset,fieldset:IFieldset,opts:ViewsetOpts){
            if(opts.initing) opts.initing.call(container,fieldset,opts);
            super(container,null,opts);
            this.container = container;
            this.fieldset = fieldset;
            
            this.excludes = typeof opts.excludes ==="string"? opts.excludes.split(/\s*,\s*/g):opts.excludes; 
            if(typeof opts.includes ==="string"){
                this.includes = parseFieldOptsSet(opts.includes,this.excludes,this.permission);
            }else{
                this.includes = opts.includes;
            }
            this.initData = this.currentData = opts.initData;


            
        }
        
        
    }
    
    
    export function parseFieldOptsSet(includeExpr:string,excludes:Array<string>,defaultPermssion:string):{[index:string]:FieldOpts}{
        let destFieldOptsSet = this.fields = {};
        
        let includes :{[index:string]:FieldOpts};
        //id，base[name:readonly,password:editable],gender:hidden
        includes={};
        let groupname;
        let groupCount=0;
        let includeExprs = includeExpr.split(",");
        for(let i =0 ,j= includeExprs.length;i<j;i++){
            let expr:string = includeExprs[i].replace(trimRegx,"");
            let name:string;let permission :string;
            if(!expr) continue;
            let at:number = expr.indexOf("[");
            let startAt:number = 0;
            if(at>=0){
                if(groupname!==undefined)throw new Error(`invalid includes expression:${includeExpr}. meet[, but the previous [ is not close. lack of ]?`);
                groupname = expr.substr(0,at);startAt = at+1;
                groupCount++;
            }else at = 0;
            at = expr.indexOf(":",startAt);
            if(at>=0){
                name = expr.substr(0,at).replace(trimRegx,"");
                permission = expr.substr(at+1).replace(trimRegx,"");
                if(!permission) throw new Error(`invalid includes expression:${includeExpr}. meet :, but permission is empty.`);;
            } else name = expr.substr(startAt).replace(trimRegx,"");
            let endGroup:boolean = false;
            if(name[name.length-1]==="]"){
                if(!groupname)throw new Error(`invalid includes expression:${includeExpr}. meet ], but not matched [. lack of [?`);;
                endGroup = true;
                name = name.substr(0,name.length-1);
            }
            if(!name)throw new Error(`invalid includes expression:${includeExpr}. Some name is empty.`);
            if(excludes && array_index(excludes,name)>=0) continue;
            
            let fieldOpts :FieldOpts={name:name};
            fieldOpts.permission = permission|| defaultPermssion;
            if(groupname!==undefined){
                if(groupname=="") groupname = ' ' + groupCount;
                fieldOpts.group = groupname;
            }
            destFieldOptsSet[name] = fieldOpts;
        }
        return destFieldOptsSet;
    }

}