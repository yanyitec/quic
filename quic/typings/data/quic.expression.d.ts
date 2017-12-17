declare namespace Quic {
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
