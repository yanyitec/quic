namespace Quic{
    export interface IPackage{
        idNo():string;
        /**
         * 获取文本信息
         * 
         * @param {string} key 
         * @param {boolean} [returnRequired] 
         * @memberof IQuic
         */
        _T(key:string,returnRequired?:boolean):string;

        /**
         * 字段定义
         * 
         * @type {{[index:string]:any}}
         * @memberof IQuic
         */
        fields:{[index:string]:any};

    }

   
    
    let arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
    let propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
    let regt =   "\\$\\{("+arrSectionRegt + "|" + propSectionRegt+")("+arrSectionRegt + "|(?:." +propSectionRegt+"))*\\}";
    let regex = new RegExp(regt,"g");
    


    function createAccess(expr:string){
        
    }
}