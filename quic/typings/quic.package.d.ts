declare namespace Quic {
    interface IPackage {
        idNo(): string;
        /**
         * 获取文本信息
         *
         * @param {string} key
         * @param {boolean} [returnRequired]
         * @memberof IQuic
         */
        _T(key: string, returnRequired?: boolean): string;
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
}
