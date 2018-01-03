/// <reference path="quic.view.d.ts" />
/// <reference path="quic.view-row.d.ts" />
/// <reference path="../quic.instance.d.ts" />
declare namespace Quic {
    namespace Views {
        interface GridViewOpts extends FormViewOpts {
            rows: any;
            total: any;
            pagesize?: number;
        }
        class GridView extends FormView {
            $columns: {
                [index: string]: ColumnView;
            };
            $opts: GridViewOpts;
            __count: number;
            __elems: any;
            constructor(opts: GridViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance);
            init(opts: GridViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance): void;
            render(decoration?: boolean): HTMLElement;
            refresh(): void;
            get_rows(): Array<object>;
            get_total(): number;
            protected buildTHead(scrollableTHead: HTMLTableSectionElement, frozenTHead: HTMLTableSectionElement): void;
            protected buildTBody(scrollableTBody: HTMLTableSectionElement, frozenTBody: HTMLTableSectionElement): void;
        }
    }
}
