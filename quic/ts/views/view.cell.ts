namespace Quic{
    export namespace Views{
        export class CellView extends View{
            row:RowView;
            column:ColumnView;
            rowIndex:number;
            constructor(column:ColumnView ,row?:RowView){
                super(null);
                this.opts = column.opts;
                this.composite = row;
                this.datasource = row.datasource;
                this.package = row.package;
                
            }        
        }
        View.viewTypes.row = RowView; 
    }
    
}