declare namespace Quic {
    interface IPackage {
        /**
         * 获取访问器
         *
         * @param {string} expression
         * @returns {*}
         * @memberof IQuic
         */
        access(expression: string): Function;
        /**
         * 获取文本信息
         *
         * @param {string} key
         * @param {boolean} [returnRequired]
         * @memberof IQuic
         */
        text(key: string, returnRequired?: boolean): string;
        /**
         * 字段定义
         *
         * @type {{[index:string]:any}}
         * @memberof IQuic
         */
        fields: {
            [index: string]: any;
        };
    }
    interface IAccess {
        (value?: any, sender?: any): any;
        deps: Array<string>;
        superior: IAccess;
    }
}
