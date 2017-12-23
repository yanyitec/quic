/// <reference path="../base/quic.utils.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
/// <reference path="quic.schema.d.ts" />
/// <reference path="quic.expression.d.ts" />
/// <reference path="../quic.package.d.ts" />
declare namespace Quic {
    namespace Models {
        interface IModel extends IDataValue {
            _$opts: ModelOpts;
            _$rawData: any;
            get_access(text: string, mixed?: boolean): IModelAccess;
        }
        interface IModelAccess {
            (value?: any, evt?: any): any;
            model?: IModel;
        }
        interface ModelOpts {
            url?: any;
            transport?: any;
            data: any;
            imports: {
                [index: string]: any;
            };
            model?: IModel;
        }
        class Model extends DataValue {
            _$opts: ModelOpts;
            _$rawData: any;
            __fetchPromise: any;
            constructor(opts: ModelOpts);
            get_access(text: string, mixed?: boolean): IModelAccess;
            __accesses: {
                [index: string]: IModelAccess;
            };
        }
    }
}
