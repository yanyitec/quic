declare namespace Quic {
    namespace Views {
        interface GridViewOpts extends FormViewOpts {
        }
        class GridView extends FormView {
            columns: {
                [index: string]: ColumnView;
            };
            opts: GridViewOpts;
            __count: number;
            constructor(opts: GridViewOpts, composite?: View, datasource?: IDataSource, pack?: IPackage);
            init(opts: GridViewOpts, composite?: View, datasource?: IDataSource, pack?: IPackage): void;
            render(decoration?: boolean): HTMLElement;
            get_rows(): Array<object>;
            get_total(): number;
            protected buildTHead(scrollableTHead: HTMLTableSectionElement, frozenTHead: HTMLTableSectionElement): void;
            protected buildTBody(scrollableTBody: HTMLTableSectionElement, frozenTBody: HTMLTableSectionElement): void;
        }
    }
}
