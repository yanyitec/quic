namespace Quic{
    export interface IExpression{
        (data:any,noneToEmpty?:string):any;
        isAccess?:boolean;
        expression?:string;
        deps?:Array<IAccess>;
    }
    /**
     * 数据访问器
     * 
     * @export
     * @interface IAccess
     */
    export interface IAccess extends IExpression{
        /**
         * @param {{[index:string]:any}} data 数据对象
         * @param {*} [value] 值。undefined=getter
         * @returns {*} 
         * @memberof IAccess
         */
        (data:{[index:string]:any},value?:any):any;
        mappath:string;
        superior?:IAccess;
    }
    
    /**
     * 访问器工厂
     * 用于产生datapath访问器
     * 
     * @export
     * @interface IAccessFactory
     */
    export interface IAccessFactory{
        
        /**
         * 获取或创建数据访问器
         * 
         * @param {string} dataPath 数据路径
         * @returns {IAccess}  该路径的数据访问器
         * @memberof IAccessFactory
         */
        getOrCreate(datapath:string):IAccess;
    }
    let self_a:any=function(data?:{[index:string]:any},value?:any){
        if(value===undefined)return data;
        throw "cannot set root data";
    }
    self_a.datapath="";
    self_a.superior = self_a;
    self_a.isAccess=true;
    let rootAccess = self_a as IAccess;

    let arrRegx:RegExp =/(?:\[(?:\d+|first|last)\])+$/g;
    let trimRegx:RegExp = /(^\s+)|(\s+$)/g;

    export class AccessFactory implements IAccessFactory{
        caches:{[dataPath:string]:IAccess};
        
        constructor(){
            this.caches = {"":rootAccess};
        }
        
        
        getOrCreate(expr:string):IAccess{
            let accessor:IAccess =  this.caches[expr];
            if(!accessor){
                accessor = this.caches[expr] = AccessFactory.create(expr,this);
            }
            return accessor;
        }
        static rootAccess:IAccess = rootAccess;
        static getOrCreate(mappath:string):IAccess{
            return AccessFactory.default.getOrCreate(mappath);
        }
        static create(dataPath:string,accessFactory?:IAccessFactory):IAccess {
            if(dataPath==""){
                return rootAccess;
            }
            let paths = dataPath.split(".");
            accessFactory ||(accessFactory=AccessFactory.default);
            let last_propname = paths.pop().replace(trimRegx,"");
            if(!last_propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            let codes = {
                factory:accessFactory,
                superior:null,
                path:"",
                getter_code:"\tif(!data)return undefined;\n",
                setter_code:"\tif(!data) throw Error('Must have root data.');\n"
            };
            for(let i =0,j=paths.length;i<j;i++){
                let propname = paths[i].replace(trimRegx,"");
                buildPropCodes(propname,dataPath,codes,false);
            }
            buildPropCodes(last_propname,dataPath,codes,true);
            
            let code = "//" + dataPath + "\n";//"if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code +="var at;\nif(value===undefined){\n" +codes.getter_code + "}else{\nif(value==='quic:undefined'){value===undefined;}\n" + codes.setter_code +  "\n}\n";
            let result= new Function("data","value",code) as (data:{[index:string]:any},value?:any)=>any;
            (<IAccess>result).superior = codes.superior;
            (<IAccess>result).mappath = codes.path;
            (<IAccess>result).expression = dataPath;
            (<IAccess>result).isAccess = true;
            (<IAccess>result).deps = [result as IAccess];
            return (<IAccess>result);
            
        };
        
        static default:AccessFactory = new AccessFactory();
    }
    function buildPropCodes(propname:string,dataPath:string,codes:any,isLast?:boolean){
        if(!propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        let match = propname.match(arrRegx);
        let nextObjValue="{}";
        let sub=undefined;
        if(match){
            sub = match.toString();
            propname = propname.substring(0,propname.length-sub.length);
            nextObjValue="[]";
        }
        
        if(sub) {
            if(propname){
                codes.getter_code += `\tif(!data.${propname}) return data.${propname};else data=data.${propname};\n`;
                codes.setter_code += `\tif(!data.${propname}) data = data.${propname}=${nextObjValue};else data = data.${propname};\n`;
                codes.path +="." + propname;
            }
            
            let subs = sub.substr(1,sub.length-2).split(/\s*\]\s*\[\s*/g);
            for(let m=0,n=subs.length-1;m<=n;m++){
                let indexAt = subs[m];
                if(indexAt==="first"){
                    codes.getter_code += `\tif(!data[0])return data[0];else data = data[0];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast){
                            codes.setter_code += `\tdata[0] = value;\n`;
                            codes.superior = codes.factory.getOrCreate(codes.path);
                        } 
                        else{
                            codes.setter_code += `\tif(!data[0]) data = data[0]={};else data=data[0];\n`;
                        } 
                    }else{
                        codes.setter_code += `\tif(!data[0]) data = data[0]=[];\n`;
                    }
                    codes.path+= "[first]";
                }else if(indexAt==="last"){
                    codes.getter_code += `\tat = data.length?data.length-1:0; if(!data[at])return data[at];else data = data[at];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) {
                            codes.setter_code += `\tat = data.length?data.length-1:0;data[at]=value;\n`;
                            codes.superior = codes.factory.getOrCreate(codes.path);
                        }
                        else{
                            codes.setter_code += `\tat = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n`;
                        } 
                        
                    }else{
                        codes.setter_code += `\tat = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n`;
                    }
                    codes.path+= "[last]";
                }else {
                    if(!/\d+/.test(indexAt)) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += `\tif(!data[${indexAt}])return data[${indexAt}];else data = data[${indexAt}];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) {
                            codes.superior = codes.factory.getOrCreate(codes.path);
                            codes.setter_code += `\tdata[${indexAt}]=value;\n`;
                            codes.getter_code += `\treturn data;\n`;
                        }
                        else {
                            codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]={};else data=data[${indexAt}];\n`;
                        }
                    }else{
                        codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]=[];else data=data[${indexAt}];\n`;
                    }
                    codes.path+= "["+indexAt+"]";
                }       
            }
            
        }else{
            if(isLast){
                if(codes.path!==dataPath){
                    codes.superior = codes.factory.getOrCreate(codes.path);
                }
                if(propname){
                    codes.getter_code += `\treturn data.${propname};\n`;
                    codes.setter_code += `\tdata.${propname}=value;\n`;
                }else{
                    codes.getter_code += `\treturn data;\n`;
                }
                
            }else{
                codes.setter_code += `\tif(!data.${propname}) data = data.${propname}=${nextObjValue};else data = data.${propname};\n`;
                codes.getter_code += `\tif(!data.${propname}) return data.${propname};else data=data.${propname};\n`;
                
            }
            codes.path +=codes.path ? "." + propname:propname;
        }
    }
    let dataPathRegx = /(?:\[(?:\d+|first|last)\])?[a-zA-Z_\$][a-zA-Z0-9_\$]*(?:\[(?:\d+|first|last)\])*(?:.[a-zA-Z_\$][a-zA-Z0-9_\$]*(?:\[(?:\d+|first|last)\])*)/g;
    

}
exports.AccessFactory = Quic.AccessFactory;