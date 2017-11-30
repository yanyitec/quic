/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.field.ts" />

namespace Quic{
    export interface FieldsetOpts {
        includes?:string | {[index:string]:FieldOpts};
        excludes?:string | Array<string>;
        css?:string;
        defaultPermssion:string;
    }
    
    export class Fieldset{
        fields:{[index:string]:FieldOpts};
        css?:string;

        constructor(opts:FieldsetOpts){
            this.css = opts.css;
            let destFieldOptsSet = this.fields = {};
            let excludes:Array<string> = 
                opts.excludes
                    ?(typeof opts.excludes ==="string"?opts.excludes.split(","):opts.excludes)
                    :undefined;
            let includes :{[index:string]:FieldOpts};
            //id，base[name:readonly,password:editable],gender:hidden
            if(typeof opts.includes==="string"){
                includes={};
                let groupname;
                let groupCount=0;
                let includeExprs = opts.includes.split(",");
                for(let i =0 ,j= includeExprs.length;i<j;i++){
                    let expr:string = includeExprs[i].replace(trimRegx,"");
                    let name:string;let permission :string;
                    if(!expr) continue;
                    let at:number = expr.indexOf("[");
                    let startAt:number = 0;
                    if(at>=0){
                        if(groupname!==undefined)throw new Error(`invalid includes expression:${opts.includes}. meet[, but the previous [ is not close. lack of ]?`);
                        groupname = expr.substr(0,at);startAt = at+1;
                        groupCount++;
                    }else at = 0;
                    at = expr.indexOf(":",startAt);
                    if(at>=0){
                        name = expr.substr(0,at).replace(trimRegx,"");
                        permission = expr.substr(at+1).replace(trimRegx,"");
                        if(!permission) throw new Error(`invalid includes expression:${opts.includes}. meet :, but permission is empty.`);;
                    } else name = expr.substr(startAt).replace(trimRegx,"");
                    let endGroup:boolean = false;
                    if(name[name.length-1]==="]"){
                        if(!groupname)throw new Error(`invalid includes expression:${opts.includes}. meet ], but not matched [. lack of [?`);;
                        endGroup = true;
                        name = name.substr(0,name.length-1);
                    }
                    if(!name)throw new Error(`invalid includes expression:${opts.includes}. Some name is empty.`);
                    if(excludes && array_index(excludes,name)>=0) continue;
                    
                    let fieldOpts :FieldOpts={name:name};
                    fieldOpts.permission = permission|| opts.defaultPermssion;
                    if(groupname!==undefined){
                        if(groupname=="") groupname = ' ' + groupCount;
                        fieldOpts.group = groupname;
                    }
                    destFieldOptsSet[name] = fieldOpts;
                }
            }else {
                this.fields = opts.includes as {[index:string]:FieldOpts};
            }
        }
    }
}