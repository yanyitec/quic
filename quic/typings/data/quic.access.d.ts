declare namespace Quic {
    interface IExpression {
        (data: {
            [index: string]: any;
        }, noneToEmpty?: string): any;
        expression?: string;
        deps?: Array<IAccess>;
    }
    /**
     * 数据访问器
     *
     * @export
     * @interface IAccess
     */
    interface IAccess extends IExpression {
        /**
         * @param {{[index:string]:any}} data 数据对象
         * @param {*} [value] 值。undefined=getter
         * @returns {*}
         * @memberof IAccess
         */
        (data: {
            [index: string]: any;
        }, value?: any): any;
        mappath: string;
        superior?: IAccess;
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
         * @returns {IAccess}  该路径的数据访问器
         * @memberof IAccessFactory
         */
        getOrCreate(datapath: string): IAccess;
    }
    class AccessFactory implements IAccessFactory {
        caches: {
            [dataPath: string]: IAccess;
        };
        constructor();
        getOrCreate(expr: string): IAccess;
        static rootAccess: IAccess;
        static getOrCreate(mappath: string): IAccess;
        static create(dataPath: string, accessFactory?: IAccessFactory): IAccess;
        static default: AccessFactory;
    }
}
