/// <reference path="quic.abstracts.d.ts" />
declare namespace Quic {
    class Field implements IField {
        name: string;
        dataType: string;
        validations: {
            [index: string]: any;
        };
        viewType: string;
        css: string;
        text: string;
        permission: string;
        fieldset: IFieldset;
        renderer: IRenderer;
        CSS: ViewCSS;
        group?: string;
        position?: string;
        mappath?: string;
        opts: FieldOpts;
        nolabel: boolean;
        mappedValue: (data: {
            [index: string]: any;
        }, value?: any) => any;
        accessFactory: IAccessFactory;
        constructor(fieldset: IFieldset, opts: FieldOpts);
        validationRule(validType: string): any;
        validationTips(localization: ITextLocalizable): {
            [index: string]: string;
        };
        validate(value: any, state?: any): string;
    }
    function mappedValue(data: {
        [index: string]: any;
    }, value?: any): any;
    interface IValidate {
        (value: any, parameter?: any, field?: Field, state?: any): boolean;
    }
    let langs: {
        "valid-required": string;
        "valid-length": string;
        "valid-length-min": string;
        "valid-length-max": string;
        "valid-length-min-max": string;
        "valid-int": string;
        "valid-int-min": string;
        "valid-int-max": string;
        "valid-int-min-max": string;
        "valid-decimal": string;
        "valid-decimal-min": string;
        "valid-decimal-max": string;
        "valid-decimal-min-max": string;
        "valid-decimal-ipart": string;
        "valid-decimal-fpart": string;
        "valid-email": string;
        "valid-url": string;
        "valid-regex": string;
    };
}
