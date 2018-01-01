/// <reference path="quic.view.d.ts" />
/// <reference path="quic.view-form.d.ts" />
declare namespace Quic {
    namespace Views {
        interface SubmitViewOpts extends ViewOpts {
            url?: string;
        }
        class SubmitView extends View {
            $url: string;
            constructor(opts: SubmitViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance);
            render_visibleonly(): HTMLElement;
            render_writable(): HTMLElement;
        }
    }
}
