declare namespace Quic {
    namespace Views {
        class RowView extends FormView {
            columns: {
                [index: string]: ColumnView;
            };
            index: number;
            constructor(grid: GridView, rowIndex: number, dataSource: IDataSource);
            render(): HTMLElement;
            dispose(): void;
            static renderCells(fields: {
                [index: string]: View;
            }, tagName: string): HTMLTableRowElement;
        }
    }
}
