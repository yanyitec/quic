declare namespace Quic {
    /**
     * 数据访问器
     *
     * @export
     * @interface IDataAccess
     */
    interface IDataAccess {
        /**
         * @param {{[index:string]:any}} data 数据对象
         * @param {*} [value] 值。undefined=getter
         * @returns {*}
         * @memberof IDataAccess
         */
        (data: {
            [index: string]: any;
        }, value?: any, sender?: any): any;
        mappath: string;
        superior?: IDataAccess;
    }
    /**
     * 访问器工厂
     * 用于产生datapath访问器
     *
     * @export
     * @interface IAccessFactory
     */
    interface IAccessFactory {
        /**
         * 获取或创建数据访问器
         *
         * @param {string} dataPath 数据路径
         * @returns {IDataAccess}  该路径的数据访问器
         * @memberof IAccessFactory
         */
        getOrCreate(datapath: string): IDataAccess;
    }
    class AccessFactory implements IAccessFactory {
        caches: {
            [dataPath: string]: IDataAccess;
        };
        constructor();
        getOrCreate(expr: string): IDataAccess;
        static rootAccess: IDataAccess;
        static getOrCreate(mappath: string): IDataAccess;
        static create(dataPath: string, accessFactory?: IAccessFactory): IDataAccess;
        static default: AccessFactory;
    }
}
