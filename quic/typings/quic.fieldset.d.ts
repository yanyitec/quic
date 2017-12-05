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
