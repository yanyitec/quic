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
    interface IValueChangeListener {
        (value: any, evtArgs?: any): any;
    }
    interface IImportItem {
        access: ISpecializedAccess;
        sourceAccess: (noneToEmpty?: string) => any;
        sourceListener: IValueChangeListener;
    }
    interface DataSourceOpts {
        data?: any;
        url?: any;
        transport?: any;
        imports?: any;
        datasource?: IDataSource;
    }
    interface IDataSource extends IPromise, IObservable {
        opts: DataSourceOpts;
        transport?: TransportOpts;
        value?: any;
        dataSource?: IDataSource;
        imports?: {
            [index: string]: IImportItem;
        };
        exprFactory: ExpressionFactory;
        incoming: any;
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
            [index: string]: IExpression;
        };
        __fetchPromise: any;
        incoming: any;
        value: any;
        imports: {
            [index: string]: IImportItem;
        };
        opts: DataSourceOpts;
        transport: TransportOpts;
        exprFactory: ExpressionFactory;
        datasource: IDataSource;
        constructor(opts: DataSourceOpts, exprFactory?: ExpressionFactory, transport?: (opts: TransportOpts) => IPromise);
        protected initImports(opts: DataSourceOpts): void;
        protected onDataArrived(incoming: any): any;
        fetch(): Promise;
        data(value?: any, sender?: any): Promise;
        expr(text: string): (noneToEmpty?: string) => any;
        access(text: string, defaultSender?: any): (value?: any, sender?: any) => any;
        dispose(): void;
    }
}
