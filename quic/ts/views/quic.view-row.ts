/// <reference path="quic.view.ts" />
/// <reference path="quic.view-column.ts" />
/// <reference path="quic.view-grid.ts" />
namespace Quic{
    export namespace Views{
        export class RowView extends FormView{
            columns:{[index:string]:ColumnView};
            cells:{[index:string]:CellView};
            index:number;
            constructor(grid:GridView,rowIndex:number,model:Models.IModel){
                super(null);
                this.$opts = grid.$opts;
                this.$composite = grid;
                this.$model = model;
                this.$quic = grid.$quic;
                this.index = rowIndex;
                this.$components= this.cells = {};
                let cols = grid.$columns;
                let me:any = this;
                for(let n in cols){
                    let col :ColumnView = cols[n];
                    let view = new CellView(col,this);
                    //View.clone(col,view,grid);
                    (<any>view).column = col;
                    me[n] = this.$components[n] = view;
                    col.$components[rowIndex] = view;

                }
            }
            render():HTMLElement{
                return RowView.renderCells(this.$components,"td");
            }
            dispose(){
                //this.datasource.dispose();
            }
            static renderCells(fields:{[index:string]:View},tagName:string):HTMLTableRowElement{
                let scrollableRow = ctx.createElement("tr") as HTMLTableRowElement;
                let frozenRow = ctx.createElement("tr");
                (<any>scrollableRow).quic_frozen_row = frozenRow;
                (<any>frozenRow).quic_scrollable_row = scrollableRow;
                for(let n in fields){
                    let cellView = fields[n];
                    let td = ctx.createElement(tagName);
                    td.appendChild(cellView.render(false));
                    let isFrozen =(<ColumnView>cellView).frozen;
                    if(isFrozen===undefined && (<CellView>cellView).column) isFrozen = (<CellView>cellView).column.frozen;   
                    if( isFrozen){
                        frozenRow.appendChild(td);
                    }else {
                        scrollableRow.appendChild(td);
                    }
                }
                return scrollableRow;
            }
            
        }
        View.viewTypes.row = RowView; 
    }
}