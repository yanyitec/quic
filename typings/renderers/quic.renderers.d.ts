declare namespace Quic {
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
