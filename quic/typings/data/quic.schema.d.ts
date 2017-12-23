declare namespace Quic {
    namespace Data {
        interface ISchema {
            props: {
                [name: string]: ISchema;
            };
            indexs: {
                [name: number]: ISchema;
            };
            prop(name: string): ISchema;
            index(nameOrIndex: string | number): ISchema;
            subscribe(listener: ISchemaValuechangeListener): ISchema;
            unsubscibe(listener: ISchemaValuechangeListener): ISchema;
            get_value(data: any, fillDefault?: boolean): any;
            set_value(data: any, value: any, evtArgs?: any): ISchema;
            notify(value: any, data: any, trigger: ISchema, evtArgs?: any): any;
            define(expr: string): ISchema;
            name: string | number;
            composite: ISchema;
            isArray: boolean;
            isObject: boolean;
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
            __listeners: Array<ISchemaValuechangeListener>;
            __stack: Array<ISchema>;
            name: string | number;
            composite: ISchema;
            isArray: boolean;
            isObject: boolean;
            constructor(name?: string, composite?: ISchema);
            prop(name: string): ISchema;
            index(name: string): ISchema;
            get_value(data: any, fillDefault?: boolean): any;
            set_value(data: any, value: any, evtArgs?: any): ISchema;
            notify(value: any, data: any, trigger: ISchema, evtArgs: any): this;
            subscribe(listener: ISchemaValuechangeListener): ISchema;
            unsubscibe(listener: ISchemaValuechangeListener): ISchema;
            define(expr: string): ISchema;
        }
    }
}
