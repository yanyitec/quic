/// <reference path="../views/quic.view.ts" />
namespace Quic{
    export namespace Packages{
        export interface IPackage extends IPromise{
            //idNo():string;
            /**
             * 获取文本信息
             * 
             * @param {string} key 
             * @param {boolean} [returnRequired] 
             * @memberof IQuic
             */
            //_T(key:string,returnRequired?:boolean):string;
    
            /**
             * 字段定义
             * 
             * @type {{[index:string]:any}}
             * @memberof IQuic
             */
            //fields:{[index:string]:any};
            field_config(setting:string,includes?:{[index:string]:Views.ViewOpts},excludes?:Array<string>,defaultPermssion?:string);
    
        }
    
        export class Package extends Promise{
            fields:{[index:string]:Views.ViewOpts};
            field_settings:{[index:string]:{[index:string]:Views.ViewOpts}};
            dynamic:boolean;
            constructor(opts:any){
                super((resolve,reject)=>{
                    this.fields  = this.field_config("",opts.fields || opts.includes);
                    resolve(this);
                });
                this.field_settings = {};
            }
            field_config(setting:string,includes?:any,excludes?:Array<string>,defaultPermission?:string){
                if(!this.fields) this.dynamic = true;
                if(this.dynamic && includes ){
                    this.fields = this.fields || {};
                    for(let n in includes){
                        let include = includes[n];
                        let field = {};
                        for(let m in include){
                            if(Views.viewOptsKeymembers[m]) field[m] = deepClone(include[m]); 
                        }
                        this.fields[n] = field;
                    }
                }
                let existed = this.field_settings[setting||""];
                if(!existed){
                    if(!this.fields){
                        throw new Exception("field is not defined");
                    }
                    if(setting.indexOf(",")>=0){
                        if(defaultPermission===undefined)defaultPermission = typeof includes==="string"?includes:"validatable";
                        includes = parseFieldOptsSet(setting,excludes,defaultPermission);
                    }
                    let result = combine(this.fields,includes,excludes);
                    if(setting) this.field_settings[setting] = result;
                    return result;
                }else {
                    if(includes){
                        return combine(existed,includes,excludes );
                    }else if(excludes){
                        let result : {[index:string]:Views.ViewOpts}={};
                        for(let name in existed){
                            let isDenied;
                            for(let i in excludes){
                                if(excludes[i]===name){isDenied=true;break;}
                            }
                            if(isDenied) continue;
                            result[name] = existed[name];
                        }
                        
                        return result;
                    }else {
                        return existed;
                    }
                    
                }
            }
    
        }
        function combine(origins:{[index:string]:Views.ViewOpts},includes?:{[index:string]:Views.ViewOpts},excludes?:Array<string>){
            if(!origins)throw new Exception("both fields and includes  are not defined");
            if(!includes) includes = origins;
            let result:{[index:string]:Views.ViewOpts}={};
            for(let name in includes){
                let include = includes[name];
                let origin = origins[name];
                if(!origin){ continue; }
                if(include===origin){ continue;}
                if(excludes){
                    let isDenied;
                    for(let i in excludes){
                        if(excludes[i]===name){isDenied=true;break;}
                    }
                    if(isDenied) continue;
                }
                
                let field = result[name] = deepClone(origin);
                
                extend(field,include,false);
            }
            return result;
        }

        function parseFieldOptsSet(includeExpr:string,excludes:Array<string>,defaultPermssion:string):{[index:string]:Views.ViewOpts}{
            let destFieldOptsSet = {};
            
            let includes :{[index:string]:Views.ViewOpts};
            //id，base[name:readonly,password:editable],gender:hidden
            includes={};
            let groupname;
            let groupCount=0;
            let includeExprs = includeExpr.split(",");
            for(let i =0 ,j= includeExprs.length;i<j;i++){
                let expr:string = includeExprs[i].replace(/(^\s+)|(\s+$)/,"");
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
                    name = expr.substr(0,at).replace(/(^\s+)|(\s+$)/,"");
                    permission = expr.substr(at+1).replace(/(^\s+)|(\s+$)/,"");
                    if(!permission) throw new Error(`invalid includes expression:${includeExpr}. meet :, but permission is empty.`);;
                } else name = expr.substr(startAt).replace(/(^\s+)|(\s+$)/,"");
                let endGroup:boolean = false;
                if(name[name.length-1]==="]"){
                    if(!groupname)throw new Error(`invalid includes expression:${includeExpr}. meet ], but not matched [. lack of [?`);;
                    endGroup = true;
                    name = name.substr(0,name.length-1);
                }
                if(!name)throw new Error(`invalid includes expression:${includeExpr}. Some name is empty.`);
                if(excludes && array_index(excludes,name)>=0) continue;
                
                let fieldOpts :Views.ViewOpts={name:name};
                fieldOpts.perm = permission|| defaultPermssion;
                if(groupname!==undefined){
                    if(groupname=="") groupname = ' ' + groupCount;
                    fieldOpts.slot = groupname;
                }
                destFieldOptsSet[name] = fieldOpts;
            }
            return destFieldOptsSet;
        }

    }
    


}