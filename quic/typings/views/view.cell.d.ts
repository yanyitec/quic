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
