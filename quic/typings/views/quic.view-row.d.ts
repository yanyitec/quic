/// <reference path="quic.view.d.ts" />
/// <reference path="quic.view-column.d.ts" />
/// <reference path="quic.view-grid.d.ts" />
declare namespace Quic {
    namespace Views {
        class RowView extends FormView {
            columns: {
                [index: string]: ColumnView;
            };
            index: number;
            constructor(grid: GridView, rowIndex: number, model: Models.IModel);
            render(): HTMLElement;
            dispose(): void;
            static renderCells(fields: {
                [index: string]: View;
            }, tagName: string): HTMLTableRowElement;
        }
    }
}
