declare namespace Quic {
    class ViewCSS implements IViewCSS {
        constructor(viewOpts: ViewOpts);
        raw: string;
        base: string;
        css(permission?: string): string;
        general(): string;
        visible: () => string;
        hidden: () => string;
        readonly: () => string;
        editable: () => string;
        validatable: () => string;
        toString: () => string;
    }
    class View implements IFieldView {
        name: string;
        viewType: string;
        text?: string;
        group?: string;
        permission?: string;
        position?: string;
        nolabel?: boolean;
        mappath?: string;
        css?: string;
        CSS?: ViewCSS;
        renderer: IRenderer;
        field?: IField;
        opts: ViewOpts;
        composition: ICompositeView;
        mappedValue: (data: {
            [index: string]: any;
        }, value?: any) => any;
        protected _element: any;
        constructor(quic: IQuic, composition: ICompositeView, field: IField, opts_: ViewOpts);
        viewValue(value?: any): any;
        element(): HTMLElement;
    }
}
