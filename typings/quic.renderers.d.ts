/// <reference path="quic.d.ts" />
/// <reference path="quic.utils.d.ts" />
/// <reference path="quic.env.d.ts" />
/// <reference path="quic.dom.d.ts" />
/// <reference path="quic.view.d.ts" />
/// <reference path="quic.field.d.ts" />
declare namespace Quic {
    let renderers: {
        [viewType: string]: IRenderer;
    };
    class TextRenderer implements IRenderer {
        constructor();
        visible(view: IView): HTMLElement;
        hidden(view: IView): HTMLElement;
        readonly(view: IView): HTMLElement;
        editable(view: IView): HTMLElement;
        setValue(view: IView, value: any): any;
        getValue(view: IView): any;
    }
}
