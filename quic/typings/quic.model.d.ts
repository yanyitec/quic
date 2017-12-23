/// <reference path="base/quic.utils.d.ts" />
/// <reference path="base/quic.observable.d.ts" />
/// <reference path="data/quic.schema.d.ts" />
/// <reference path="data/quic.expression.d.ts" />
/// <reference path="quic.package.d.ts" />
declare namespace Quic {
    interface IModel {
        data: any;
        rootSchema: Data.ISchema;
        access(text: string): Data.IAccess;
        refresh(): IModel;
    }
    interface IModelAccess extends Data.IAccess {
        model?: IModel;
    }
    class Model {
        data: any;
        rootSchema: Data.ISchema;
        constructor(data: any, rootSchema?: Data.ISchema);
        access(text: string): IModelAccess;
        refresh(): IModel;
        __compare: any;
        __accesses: {
            [index: string]: IModelAccess;
        };
    }
}
