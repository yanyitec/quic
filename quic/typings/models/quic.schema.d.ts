declare namespace Quic {
    namespace Models {
        interface IOnProperty {
            (name: string, schema: ISchema, rootSchema: ISchema): any;
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
            define(expr: string, onProperty?: IOnProperty): ISchema;
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
            constructor(name?: string, composite?: ISchema);
            prop(name: string): ISchema;
            index(name: string): ISchema;
            define(expr: string, onProperty?: IOnProperty): ISchema;
        }
    }
}
