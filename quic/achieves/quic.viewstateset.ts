
namespace Quic{
    /**
     * 视图集合选项。创建视图集时作为参数
     * 可以当作视图选项来用
     * @export
     * @interface ViewStateSetOpts
     * @extends {ViewOpts} 可以当作视图选项来用
     */
    interface ViewStateSetOpts extends ViewOpts {
        /**
         * //要包含的域s表达式或域s配置
         * 域表达式的例子: [id:hidden,name:validatable,pwd:validatable],person[gender:editable]
         * @type {(string | {[fieldname:string]:FieldOpts})}
         * @memberof ViewStateSetOpts
         */
        fields?: string | {
            [fieldname: string]: FieldOpts;
        };
        /**
         * 要排除的字段/域的名字
         *
         * @type {(string | Array<string>)}
         * @memberof ViewStateSetOpts
         */
        excludes?: string | Array<string>;
        /**
         * //初始化数据
         *
         * @type {{[index:string]:any}}
         * @memberof ViewStateSetOpts
         */
        initData?: {
            [index: string]: any;
        };
        
        dataSource:DataSourceOpts;
    }

    export class FieldsetStateView extends ViewState implements ViewStateSetOpts{
       
        //字段集
        fieldset:IFieldset;
        quic :IQuic;

        //要包含的域s表达式或域s配置
        includes?:{[fieldname:string]:FieldOpts};
        //要排除的域的名字
        excludes?:Array<string>;
        
        controller:IController;
        initData:{[index:string]:any};
        currentData:  {[index:string]:any};
        dataSource :DataSourceOpts;

        constructor(view:IView,opts:ViewStateSetOpts,composit:IView,field:IField){
            super(view,opts,composit,field);
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