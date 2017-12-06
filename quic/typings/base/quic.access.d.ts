declare namespace Quic {
    /**
     * 数据访问器
     *
     * @export
     * @interface IDataAccess
     */
    interface IDataAccess {
        /**
         *
         *
         * @param {{[index:string]:any}} data 数据对象
         * @param {*} [value] 值。undefined=getter
         * @returns {*}
         * @memberof IDataAccess
         */
        (data: {
            [index: string]: any;
        }, value?: any): any;
        datapath: string;
        superior: IDataAccess;
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
         * 创建数据访问器
         *
         * @param {string} dataPath 数据路径
         * @param {string} dataPath 数据路径
         * @returns {IDataAccess} 该路径的数据访问器
         * @memberof IAccessFactory
         */
        create(dataPath: string, factory?: any): IDataAccess;
        /**
         * 获取或创建数据访问器
         *
         * @param {string} dataPath 数据路径
         * @returns {IDataAccess}  该路径的数据访问器
         * @memberof IAccessFactory
         */
        cached(dataPath: string): IDataAccess;
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
        create(dataPath: string): IDataAccess;
        cached(datapath: string): IDataAccess;
        getOrCreate(dataPath: string): IDataAccess;
        static rootAccess: IDataAccess;
        static create(dataPath: string, factory: IAccessFactory): IDataAccess;
        static getOrCreate(dataPath: string): IDataAccess;
        static cached(dataPath: string): IDataAccess;
        static instance: AccessFactory;
    }
}
