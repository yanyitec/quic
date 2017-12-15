namespace Quic{
    export interface IPackage{
        /**
         * 获取访问器
         * 
         * @param {string} expression 
         * @returns {*} 
         * @memberof IQuic
         */
        access(expression:string):Function;
        /**
         * 获取文本信息
         * 
         * @param {string} key 
         * @param {boolean} [returnRequired] 
         * @memberof IQuic
         */
        text(key:string,returnRequired?:boolean):string;

        /**
         * 字段定义
         * 
         * @type {{[index:string]:any}}
         * @memberof IQuic
         */
        fields:{[index:string]:any};

    }

    export interface IAccess{
        (value?:any,sender?:any):any;
        deps:Array<string>;
        superior: IAccess;
    }
    
    let arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
    let propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
    let regt =   "\\$\\{("+arrSectionRegt + "|" + propSectionRegt+")("+arrSectionRegt + "|(?:." +propSectionRegt+"))*\\}";
    let regex = new RegExp(regt,"g");
    


    function createAccess(expr:string){
        
    }
}