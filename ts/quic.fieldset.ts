/// <reference path="quic.data.ts" />
/// <reference path="quic.view.ts" />
namespace Quic{
    export interface FieldsetOpts extends ViewOpts,DataFieldOpts{
        fields?:{[index:string]:FieldOpts};
        includes?:string;
        excludes?:string;
        //forbidden=禁止分组，ignoreOrgin=忽略原分组(fieldOpts设置的分组)
        group?:string;
    }
    export class Fieldset implements View{
        fields:{[index:string]:Field};
        nogroup:{[index:string]:Field};
        groups:{[index:string]:{[index:string]:Field}};
        container:View;
        viewType : string;
        name:string;
        css:ViewCSS;
        opts:FieldsetOpts;
        //id,g1[username,password]
        constructor(container:View,existedFields:{[index:string]:Field},opts:FieldsetOpts){
            this.opts = opts;
            let fields = this.fields={};
            this.viewType = "fieldset";
            
            
            

        }
        private _fillFields(existedOptsSet:{[index:string]:FieldOpts},setOpts:FieldsetOpts){
            let includes:Array<string> = (setOpts.includes) ? setOpts.includes.split(","):[];
            let excludes:Array<string> = (setOpts.excludes)?  setOpts.excludes.split(","):undefined;
            var arr_index = function(arr,value,at?:any){
                if(!arr) return -1;
                for(let i=at||0,j=arr.length;i<j;i++){
                    if(arr[i]===value) return i;
                }
                return -1;
            }
            let fieldnames = "";

            let env:Env = Quic.env;
            let groupSetting = setOpts.group;
            let groupCount=0;
            let groupname :string;
            let originGroup ={};
            for(let i =0 ,j= includes.length;i<j;i++){
                let name = includes[i].replace(trimRegx,"");
                
                let at = name.indexOf("[");
                if(at>=0){
                    groupname = name.substr(0,at)|| "*"+groupCount;
                    groupCount++;
                    name = name.substr(at+1);
                }
                if(!name || arr_index(excludes,name)!=-1)continue;

                let fieldOpts :FieldOpts = extend(null,(setOpts.fields?setOpts.fields[name]:null),(existedOptsSet?existedOptsSet[name]:null);
                if(!fieldOpts){
                    env.warn(`field[${name}] is invalid in includes:${setOpts.includes}`);
                    continue;
                }
                
                let field:Field = this.fields[name] = new Field(this,fieldOpts);
                fieldnames += fieldnames?name:"," + name;
                if(groupSetting==='forbidden') continue;
                if(groupCount==0){
                    if(groupSetting==="ignoreOrigin"){
                        continue;
                    }else if(field.group){
                        originGroup[field.group]
                    }
                }

            }
        }
    }
    
    //viewBuilders.
}