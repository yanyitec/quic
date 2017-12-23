/// <reference path="quic.schema.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
declare namespace Quic {
    namespace Models {
        interface IDataValue {
            subscribe(listener: IValueChangeListener): IDataValue;
            unsubscibe(listener: IValueChangeListener): IDataValue;
            get_value(fillDefault?: boolean): any;
            set_value(value: any, evtArgs?: any): any;
            notify(evt: ValueChangeEventArgs): any;
            define(text: string): IDataValue;
            delete(name: string): IDataValue;
            updateSchema(): IDataValue;
        }
        interface ValueChangeEventArgs {
            value: any;
            old_value: any;
            publisher: IDataValue;
            src: ValueChangeEventArgs;
            index?: number;
        }
        interface IValueChangeListener {
            (value: any, publisher: IDataValue, evtArgs: ValueChangeEventArgs): any;
        }
        class DataValue implements IDataValue {
            _$superior: IDataValue;
            _$schema: ISchema;
            __listeners?: Array<IValueChangeListener>;
            length?: number;
            constructor(schema: ISchema, superior: IDataValue);
            get_data(): any;
            get_value(): any;
            set_value(value: any, srcEvtArgs?: any): any;
            subscribe(listener: IValueChangeListener): IDataValue;
            unsubscibe(listener: IValueChangeListener): IDataValue;
            notify(evtArgs: ValueChangeEventArgs): IDataValue;
            define(text: string): IDataValue;
            delete(name: string | number): IDataValue;
            updateSchema(): IDataValue;
            toString(): any;
        }
    }
}
