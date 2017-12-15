/// <reference path="quic.promise.d.ts" />
/// <reference path="quic.context.d.ts" />
/// <reference path="quic.ajax.d.ts" />
/// <reference path="quic.access.d.ts" />
declare namespace Quic {
    interface Pagable {
        server_paging: boolean;
        page_index: number;
        page_size: number;
    }
    interface RemoteDataSchema {
        rows: string | Function;
        total: string | Function;
    }
    interface DataSourceOpts {
        data?: any;
        transport?: any;
        schema: RemoteDataSchema;
        pagable: Pagable;
    }
    function clone(value: any): any;
    class DataResource extends Observable {
        __data: any;
        __isFetching: any;
        __transport: any;
        opts: DataSourceOpts;
        _schema_rows: Function;
        _schema_total: Function;
        ajax: (opts: any) => IPromise;
        constructor(opts: any, accessFactory?: AccessFactory, _ajax?: (opts: any) => IPromise);
        fetch(): Promise;
        data(value?: any): Promise;
    }
}
