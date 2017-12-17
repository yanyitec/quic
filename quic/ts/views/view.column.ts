namespace Quic{
    export namespace Views{
        export interface ColumnViewOpts extends ViewOpts{
            frozen?:boolean;
            resizable?:boolean;
            width?:number;
        }

        export class ColumnView extends FormView{
            frozen?:boolean;
            resizable ?:boolean;
            constructor(opts:ColumnViewOpts,grid?:GridView){
                super(opts,grid,undefined);
                this.frozen = opts.frozen;
                this.resizable  = opts.resizable;
                this.components = {};
            }
            render():HTMLElement{
                let th = ctx.createElement("th");
                th.innerHTML = this.width?"<div style='width:"+this.width+"px;'>" + this.text + "</div>":"<div>" + this.text + "</div>";
                th.title = this.description;
                return th;
                
            }
            
        }
        View.viewTypes.row = RowView; 
    }    
}