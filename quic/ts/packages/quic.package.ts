/// <reference path="../views/quic.view.ts" />
namespace Quic{
    export namespace Packages{
        export interface IPackage{
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
            field_config(setting:string,includes?:{[index:string]:Views.ViewOpts},excludes?:Array<string>);
    
        }
    
        export class Package{
            fields:{[index:string]:Views.ViewOpts};
            field_settings:{[index:string]:{[index:string]:Views.ViewOpts}};
            dynamic:boolean;
            constructor(opts:any){
                if(!opts) this.dynamic=true;
            }
            field_config(setting:string,includes?:{[index:string]:Views.ViewOpts},excludes?:Array<string>){
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
                let existed = this.field_settings[setting];
                if(!existed){
                    if(!this.fields){
                        throw new Exception("field is not defined");
                    }
                    return combine(this.fields,includes,excludes);
                }else {
                    return combine(existed,includes,excludes );
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
                if(excludes){
                    let isDenied;
                    for(let i in excludes){
                        if(excludes[i]===name){isDenied=true;break;}
                    }
                    if(isDenied) continue;
                }
                let field = result[name] = deepClone(origin);
                if(include===origin){ continue;}
                extend(field,include,false);
            }
            return result;
        }
    }
    


}