/// <reference path="../base/quic.utils.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
/// <reference path="quic.expression.d.ts" />
declare namespace Quic {
    namespace Models {
        interface IOnProperty {
            (name: string, schema: ISchema, reset?: boolean): any;
        }
        interface DefineOpts {
            expression: Expression;
            text: string;
            schema: ISchema;
        }
        interface IDataDefiner {
            define(name: string): IDataDefiner;
            find(expr: string, onProperty?: IOnProperty): IDataDefiner;
            parse(expr: string, onProperty?: IOnProperty): DefineOpts | IDataDefiner;
        }
        interface ISchema extends IDataDefiner {
            props: {
                [name: string]: ISchema;
            };
            indexs: {
                [name: number]: ISchema;
            };
            itemSchema: ISchema;
            name: string | number;
            composite: ISchema;
            isArray: boolean;
            isObject: boolean;
            root: Schema;
        }
        interface ISchemaValuechangeListener {
            (value: any, data: any, trigger: ISchema, evtArgs: any): any;
        }
        class Schema implements ISchema {
            props: {
                [name: string]: ISchema;
            };
            indexs: {
                [name: number]: ISchema;
            };
            name: string | number;
            composite: ISchema;
            itemSchema: ISchema;
            isArray: boolean;
            isObject: boolean;
            root: Schema;
            __defines: {
                [index: string]: DefineOpts;
            };
            constructor(name?: string, composite?: ISchema);
            define(name: string): IDataDefiner;
            find(text: string, onProperty?: IOnProperty): ISchema;
            parse(text: string, onProperty?: IOnProperty): DefineOpts;
        }
    }
}
