/// <reference path="../base/quic.utils.d.ts" />
/// <reference path="../base/quic.context.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
/// <reference path="../base/quic.promise.d.ts" />
/// <reference path="../base/quic.transport.d.ts" />
/// <reference path="quic.schema.d.ts" />
/// <reference path="quic.expression.d.ts" />
/// <reference path="quic.value.d.ts" />
declare namespace Quic {
    namespace Models {
        interface IModel extends IDataValue {
            fetch(): IPromise;
        }
        interface IModelAccess {
            (value?: any, evt?: any): any;
            model?: IModel;
        }
        interface ModelOpts {
            url?: any;
            transport?: any;
            data?: any;
            imports?: {
                [index: string]: any;
            };
            src_model?: IModel;
            schema?: ISchema;
        }
        class Model extends DataValue implements IModel {
            $opts: ModelOpts;
            $src_model: IModel;
            $transport: TransportOpts;
            $imports: Array<Function>;
            $raw: any;
            $rootData: any;
            $data: any;
            __fetchPromise: IPromise;
            constructor(opts: ModelOpts, rootData?: any);
            fetch(): IPromise;
            __onDataArrived(raw: any, resolve: any, reject: any): void;
        }
    }
}
