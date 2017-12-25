/// <reference path="../base/quic.utils.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
/// <reference path="quic.expression.d.ts" />
/// <reference path="../quic.package.d.ts" />
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
        interface ISchema {
            props: {
                [name: string]: ISchema;
            };
            indexs: {
                [name: number]: ISchema;
            };
            itemSchema: ISchema;
            prop(name: string): ISchema;
            index(nameOrIndex: string | number): ISchema;
            find(expr: string, onProperty?: IOnProperty): ISchema;
            parse(expr: string, onProperty?: IOnProperty): DefineOpts;
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
            prop(name: string): ISchema;
            index(name: string): ISchema;
            find(text: string, onProperty?: IOnProperty): ISchema;
            parse(text: string, onProperty?: IOnProperty): DefineOpts;
        }
    }
}
