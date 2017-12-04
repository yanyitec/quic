/// <reference path="quic.d.ts" />
/// <reference path="quic.utils.d.ts" />
/// <reference path="quic.field.d.ts" />
declare namespace Quic {
    class Fieldset implements IFieldset, FieldsetOpts {
        quic: IQuic;
        fields: {
            [index: string]: IField;
        };
        langs?: {
            [index: string]: string;
        };
        opts: FieldsetOpts;
        defs: FieldsetDefs;
        accessFactory: IAccessFactory;
        constructor(quic: IQuic, opts: FieldsetOpts);
        _T(text: string, mustReturn?: boolean): string;
        fieldValue(fieldOpts: FieldOpts, fieldElement: HTMLElement, data: any, value?: any): any;
    }
}
