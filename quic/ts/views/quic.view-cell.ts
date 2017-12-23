/// <reference path="quic.view.ts" />
/// <reference path="quic.view-row.ts" />
/// <reference path="quic.view-column.ts" />
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
                this.model = row.model;
                this.package = row.package;
            }        
        }
        View.viewTypes.row = RowView; 
    }
    
}
exports.CellView = Quic.Views.CellView;