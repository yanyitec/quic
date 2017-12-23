/// <reference path="quic.view.d.ts" />
/// <reference path="quic.view-row.d.ts" />
/// <reference path="quic.view-column.d.ts" />
declare namespace Quic {
    namespace Views {
        class CellView extends View {
            row: RowView;
            column: ColumnView;
            rowIndex: number;
            constructor(column: ColumnView, row?: RowView);
        }
    }
}
