declare namespace Quic {
    class CompositeView extends View implements ICompositeView {
        components: {
            [viewname: string]: IView;
        };
        constructor(quic: IQuic, pomposition: ICompositeView, field: IField, opts: ViewOpts);
        close(): void;
        dispose(): void;
    }
}
