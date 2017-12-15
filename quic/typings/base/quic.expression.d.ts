declare namespace Quic {
    interface IExpression {
        (data: {
            [index: string]: any;
        }, noneToEmpty?: boolean): any;
        text?: string;
        deps?: Array<IDataAccess>;
    }
    interface IExpressionFactory {
        accessFactory: IAccessFactory;
        getOrCreate(expr: string): IExpression;
    }
    class ExpressionFactory {
        accessFactory: IAccessFactory;
        caches: {
            [index: string]: IExpression;
        };
        constructor(accessFactory?: IAccessFactory);
        getOrCreate(text: string): IExpression;
        static default: IExpressionFactory;
        static getOrCreate(text: string): IExpression;
        static create(text: string, accessFactory: IAccessFactory): any;
    }
}
