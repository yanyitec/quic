declare namespace Quic {
    namespace Views {
        interface FormViewOpts extends ViewOpts {
            fields?: {
                [index: string]: ViewOpts;
            };
            title?: string;
        }
        class FormView extends View {
            opts: FormViewOpts;
            components: {
                [index: string]: View;
            };
            private __disabled;
            constructor(opts: FormViewOpts, composite?: View, datasource?: IDataSource, pack?: IPackage);
            permission(value?: string): any;
            render(decoration?: boolean): HTMLElement;
            protected render_visibleonly(decoration?: boolean): HTMLElement;
            protected render_writable(decoration?: boolean): HTMLElement;
            protected init(opts: FormViewOpts, composite?: View, datasource?: IDataSource, pack?: IPackage): void;
        }
    }
}
