/// <reference path="quic.view.d.ts" />
declare namespace Quic {
    namespace Views {
        interface FormViewOpts extends ViewOpts {
            fields?: {
                [index: string]: ViewOpts;
            };
            title?: string;
        }
        class FormView extends View {
            private __disabled;
            opts: FormViewOpts;
            components: {
                [index: string]: View;
            };
            constructor(opts: FormViewOpts, composite?: View, model?: Models.IModel, pack?: IPackage);
            permission(value?: string): any;
            render(decoration?: boolean): HTMLElement;
            protected render_visibleonly(decoration?: boolean): HTMLElement;
            protected render_writable(decoration?: boolean): HTMLElement;
            protected init(opts: FormViewOpts, composite?: View, model?: Models.IModel, pack?: IPackage): void;
        }
    }
}
