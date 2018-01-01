/// <reference path="quic.view.d.ts" />
declare namespace Quic {
    namespace Views {
        interface FormViewOpts extends ViewOpts {
            fields?: {
                [index: string]: ViewOpts;
            };
            title?: string;
            commit_transport?: TransportOpts;
        }
        class FormView extends View {
            private __disables;
            $opts: FormViewOpts;
            $components: {
                [index: string]: View;
            };
            constructor(opts: FormViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance);
            permission(value?: string): any;
            render(decoration?: boolean): HTMLElement;
            validate(state?: any): any;
            waiting(block?: boolean): void;
            submit(url: string): Promise;
            protected render_visibleonly(decoration?: boolean): HTMLElement;
            protected render_writable(decoration?: boolean): HTMLElement;
            protected init(opts: FormViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance): void;
        }
    }
}
