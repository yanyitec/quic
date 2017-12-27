/// <reference path="quic.schema.d.ts" />
/// <reference path="../base/quic.utils.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
declare namespace Quic {
    namespace Models {
        interface IDataValue extends IDataDefiner {
            $super: any;
            $root: any;
            _$schema: any;
            subscribe(listener: IValueChangeListener): IDataValue;
            unsubscibe(listener: IValueChangeListener): IDataValue;
            get_value(fillDefault?: boolean): any;
            set_value(value: any, evtArgs?: any): any;
            notify(evt: ValueChangeEventArgs): any;
            delete(name: string): IDataValue;
            define(name: string): IDataValue;
            find(expr: string, onProperty?: IOnProperty): IDataValue;
            parse(expr: string, onProperty?: IOnProperty): IDataValue;
        }
        interface ValueChangeEventArgs {
            value: any;
            old_value: any;
            publisher: IDataValue;
            src: ValueChangeEventArgs;
            index?: number;
            cancel?: boolean;
        }
        interface IValueChangeListener {
            (value: any, publisher: IDataValue, evtArgs: ValueChangeEventArgs): any;
        }
        class DataValue implements IDataValue {
            $super: IDataValue;
            $root: IDataValue;
            _$schema: ISchema;
            _$data: any;
            __name: string | number;
            __item: IDataValue;
            __listeners?: Array<IValueChangeListener>;
            __computes?: {
                [index: string]: DataValue;
            };
            length?: number;
            constructor(schema: ISchema, superior: IDataValue, specialname?: number | string);
            get_data(): any;
            get_value(): any;
            set_value(value: any, srcEvtArgs?: any): any;
            subscribe(listener: IValueChangeListener): IDataValue;
            unsubscibe(listener: IValueChangeListener): IDataValue;
            notify(evtArgs: ValueChangeEventArgs): IDataValue;
            define(name: string | number): IDataValue;
            find(text: string, onProp?: IOnProperty): IDataValue;
            parse(text: string, onProp?: IOnProperty): IDataValue;
            delete(name: string | number): IDataValue;
            toString(): any;
        }
    }
}
