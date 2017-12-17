namespace Quic{
    export namespace Views{
        export class RowView extends FormView{
            columns:{[index:string]:ColumnView};
            index:number;
            constructor(grid:GridView,rowIndex:number,dataSource:IDataSource){
                super(null);
                this.opts = grid.opts;
                this.composite = grid;
                this.datasource = dataSource;
                this.package = grid.package;
                this.index = rowIndex;
                this.components={};
                let cols = grid.columns;
                for(let n in cols){
                    let col :ColumnView = cols[n];
                    let view = new CellView(col,this);
                    View.clone(col,view,grid);
                    (<any>view).column = col;
                    this.components[n] = view;
                    col.components[rowIndex] = view;
                }
            }
            render():HTMLElement{
                return RowView.renderCells(this.components,"td");
            }
            dispose(){
                this.datasource.dispose();
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
                    if((<ColumnView>cellView).frozen || (<CellView>cellView).column.frozen){
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