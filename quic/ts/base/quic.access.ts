namespace Quic{
    /**
     * 数据访问器
     * 
     * @export
     * @interface IDataAccess
     */
    export interface IDataAccess{
        /**
         * 
         * 
         * @param {{[index:string]:any}} data 数据对象
         * @param {*} [value] 值。undefined=getter
         * @returns {*} 
         * @memberof IDataAccess
         */
        (data:{[index:string]:any},value?:any):any;
        datapath:string;
        superior:IDataAccess;
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
         * 创建数据访问器
         * 
         * @param {string} dataPath 数据路径
         * @param {string} dataPath 数据路径
         * @returns {IDataAccess} 该路径的数据访问器
         * @memberof IAccessFactory
         */
        create(dataPath:string,factory?:any):IDataAccess;
        /**
         * 获取或创建数据访问器
         * 
         * @param {string} dataPath 数据路径
         * @returns {IDataAccess}  该路径的数据访问器
         * @memberof IAccessFactory
         */
        cached(dataPath:string):IDataAccess;
        /**
         * 获取或创建数据访问器
         * 
         * @param {string} dataPath 数据路径
         * @returns {IDataAccess}  该路径的数据访问器
         * @memberof IAccessFactory
         */
        getOrCreate(datapath:string):IDataAccess;
    }
    let self_a:any=function(data?:{[index:string]:any},value?:any){
        if(value===undefined)return data;
        throw "cannot set root data";
    }
    self_a.datapath="";
    self_a.superior = self_a;
    let rootAccess = self_a as IDataAccess;

    let arrRegx:RegExp =/(?:\[(?:\d+|first|last)\])+$/g;
    let trimRegx:RegExp = /(^\s+)|(\s+$)/g;

    export class AccessFactory implements IAccessFactory{
        caches:{[dataPath:string]:IDataAccess};
        constructor(){
            this.caches = {"":rootAccess};
        }
        create(dataPath:string):IDataAccess{
            return AccessFactory.create(dataPath,this);
        }
        cached(datapath:string):IDataAccess{
            return this.getOrCreate(datapath);
        }
        getOrCreate(dataPath:string):IDataAccess{
            let accessor:IDataAccess =  this.caches[dataPath];
            if(!accessor){
                accessor = this.caches[dataPath] = AccessFactory.create(dataPath,this);
            }
            return accessor;
        }
        static rootAccess:IDataAccess = rootAccess;
        static create(dataPath:string,factory:IAccessFactory):IDataAccess {
            if(dataPath==""){
                return rootAccess;
            }
            let paths = dataPath.split(".");
            
            let last_propname = paths.pop().replace(trimRegx,"");
            if(!last_propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            let codes = {
                factory:factory,
                superior:null,
                path:"",
                getter_code:"if(!data)return undefined;\n",
                setter_code:"if(!data) throw Error('Must have root data.');\n"
            };
            for(let i =0,j=paths.length;i<j;i++){
                let propname = paths[i].replace(trimRegx,"");
                buildPropCodes(propname,dataPath,codes,false);
            }
            buildPropCodes(last_propname,dataPath,codes,true);
            let code = "";//"if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code +="var at;\nif(value===undefined){\n" +codes.getter_code + "}else{\n" + codes.setter_code + "\n}\n";
            let result= new Function("data","value",code) as (data:{[index:string]:any},value?:any)=>any;
            (<IDataAccess>result).datapath = dataPath;
            (<IDataAccess>result).superior = codes.superior;
            return (<IDataAccess>result);
            
        };
        static getOrCreate(dataPath:string):IDataAccess{
            return AccessFactory.instance.getOrCreate(dataPath);
        }
        static cached(dataPath:string):IDataAccess{
            return AccessFactory.instance.getOrCreate(dataPath);
        }
        static instance:AccessFactory = new AccessFactory();
    }
    function buildPropCodes(propname:string,dataPath:string,codes:any,isLast?:boolean){
        if(!propname) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        let match = arrRegx.exec(propname);
        let nextObjValue="{}";
        let sub=undefined;
        if(match){
            sub = match.toString();
            propname = propname.substring(0,propname.length-sub.length);
            nextObjValue="[]";
        }
        
        if(sub) {
            codes.getter_code += `if(!data.${propname}) return data.${propname};else data=data.${propname};\n`;
            codes.setter_code += `if(!data.${propname}) data = data.${propname}=${nextObjValue};\n`;
            codes.path +="." + propname;
            let subs = sub.substr(1,sub.length-2).split(/\s*\]\s*\[\s*/g);
            for(let m=0,n=subs.length-1;m<=n;m++){
                let indexAt = subs[m];
                if(indexAt==="first"){
                    codes.getter_code += `if(!data[0])return data[0];else data = data[0];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast){
                            codes.setter_code += `data[0] = value;\n`;
                            codes.superior = codes.factory.cached(codes.path);
                        } 
                        else{
                            codes.setter_code += `if(!data[0]) data = data[0]={};else data=data[0];\n`;
                        } 
                    }else{
                        codes.setter_code += `if(!data[0]) data = data[0]=[]"\n`;
                    }
                    codes.path+= "[first]";
                }else if(indexAt==="last"){
                    codes.getter_code += `at = data.length?data.length-1:0; if(!data[at])return data[at];else data = data[at];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) {
                            codes.setter_code += `at = data.length?data.length-1:0;data[at]=value";\n`;
                            codes.superior = codes.factory.cached(codes.path);
                        }
                        else{
                            codes.setter_code += `at = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n`;
                        } 
                        
                    }else{
                        codes.setter_code += `at = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n`;
                    }
                    codes.path+= "[last]";
                }else {
                    if(!/\d+/.test(indexAt)) throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += `if(!data[${indexAt}])return data[${indexAt}];else data = data[${indexAt}];\n`;
                    if(m==n){
                        //最后一个[]
                        if(isLast) {
                            codes.superior = codes.factory.cached(codes.path);
                            codes.setter_code += `data[${indexAt}]=value";\n`;
                        }
                        else {
                            codes.setter_code += `if(!data[${indexAt}]) data = data[${indexAt}]={};else data=data[${indexAt}];\n`;
                        }
                    }else{
                        codes.setter_code += `if(!data[${indexAt}]) data = data[${indexAt}]=[];else data=data[${indexAt}];\n`;
                    }
                    codes.path+= "["+indexAt+"]";
                }       
            }
            
        }else{
            if(isLast){
                if(codes.path!==dataPath){
                    codes.superior = codes.factory.cached(codes.path);
                }
                codes.getter_code += `return data.${propname};\n`;
                codes.setter_code += `data.${propname}=value;\n`;
            }else{
                codes.setter_code += `if(!data.${propname}) data = data.${propname}=${nextObjValue};else data = data.${propname};\n`;
                codes.getter_code += `if(!data.${propname}) return data.${propname};else data=data.${propname};\n`;
                
            }
            codes.path +=codes.path ? "." + propname:propname;
        }
    }
}
exports.AccessFactory = Quic.AccessFactory;