/// <reference path="../base/quic.promise.d.ts" />
/// <reference path="../base/quic.context.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
/// <reference path="../base/quic.transport.d.ts" />
/// <reference path="quic.access.d.ts" />
/// <reference path="quic.expression.d.ts" />
declare namespace Quic {
    interface ISpecializedAccess {
        (value?: any, sender?: any): any;
        defaultSender?: any;
        rawAccess?: IAccess;
    }
    interface DataSourceOpts {
        data?: any;
        transport?: any;
    }
    interface IDataSource extends IPromise {
        opts: DataSourceOpts;
        transport: (opts: TransportOpts) => IPromise;
        exprFactory: ExpressionFactory;
        rawData: any;
        fetch(): Promise;
        data(value?: any, sender?: any): Promise;
        expr(text: string): (noneToEmpty?: string) => any;
        access(text: string, defaultSender?: any): (value?: any, sender?: any) => any;
        dispose(): any;
    }
    class DataSource extends Observable {
        __accesses: {
            [index: string]: ISpecializedAccess;
        };
        __exprs: {
            [index: string]: (noneToEmpty?: string) => any;
        };
        rawData: any;
        __fetchPromise: any;
        __transport: any;
        opts: DataSourceOpts;
        transport: (opts: TransportOpts) => IPromise;
        exprFactory: ExpressionFactory;
        constructor(opts: any, exprFactory?: ExpressionFactory, transport?: (opts: TransportOpts) => IPromise);
        fetch(): Promise;
        data(value?: any, sender?: any): Promise;
        expr(text: string): (noneToEmpty?: string) => any;
        access(text: string, defaultSender?: any): (value?: any, sender?: any) => any;
        dispose(): void;
    }
}
