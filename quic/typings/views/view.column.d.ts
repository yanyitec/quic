declare namespace Quic {
    namespace Views {
        interface ColumnViewOpts extends ViewOpts {
            frozen?: boolean;
            resizable?: boolean;
            width?: number;
        }
        class ColumnView extends FormView {
            frozen?: boolean;
            resizable?: boolean;
            constructor(opts: ColumnViewOpts, grid?: GridView);
            render(): HTMLElement;
        }
    }
}
