namespace Quic{
    export namespace Views{
        export interface GridViewOpts extends FormViewOpts{
            
        }
        export class GridView extends FormView{
            columns:{[index:string]:ColumnView};
            opts:GridViewOpts;
            __count:number;
            constructor(opts:GridViewOpts,composite?:View,datasource?:IDataSource,pack?:IPackage){
                super(opts,composite,datasource,pack);
                
            }
            init(opts:GridViewOpts,composite?:View,datasource?:IDataSource,pack?:IPackage){
                let fields = opts.fields;
                opts.fields = null;
                super.init(opts,composite,datasource,pack);
                opts.fields= fields;
                this.columns={};
                for(let n in fields){
                    let columnOpts = fields[n];
                    let column = new ColumnView(columnOpts,this);
                    this.columns[n] = column;
                }
                this.components = {};
            }

            render(decoration?:boolean):HTMLElement{
                let element = ctx.createElement("div");
                let title = this.opts.title;
                let html = '<div class="quic-header"><span class="quic-caption">' + title + '</span><span class="quic-actions"></span></div>';
                html += '<div class="quic-body"><div class="quic-filter"></div><div class="quic-tb">'
                            +'<div class="quic-thead">'
                                +'<div class="quic-thead-frozen"><table><thead></thead></table></div>'
                                +'<div class="quic-thead-scrollable"><table><thead></thead></table></div>'
                            +'</div>'
                            +'<div class="quic-tbody">'
                                +'<div class="quic-tbody-frozen"><table><tbody></tbody></table></div>'
                                +'<div class="quic-tbody-scrollable"><table><tbody></tbody></table></div>'
                            +'</div>'
                        +'</div></div>';
                html += '<div class="quic-footer"><span class="quic-status"></span><span class="quic-actions"></span></div>';
                element.innerHTML = html;
                let caption = element.firstChild.firstChild as HTMLElement;
                let headAtions = element.firstChild.lastChild;
                let body = element.childNodes[1];
                let filter = body.firstChild;
                let tb = body.lastChild;
                let frozenTHead = tb.firstChild.firstChild.firstChild;
                let scrollableTHead = tb.firstChild.lastChild.firstChild;
                let frozenTBody = tb.lastChild.firstChild.firstChild;
                let scrollableTBody= tb.lastChild.lastChild.firstChild;
                let status = element.lastChild.firstChild;
                let footActions = element.lastChild.lastChild;
                caption.innerHTML = title;
                return element;
            }

            get_rows():Array<object>{
                throw "not implement";
            }
            get_total():number{
                throw "not implement";
            }
            protected buildTHead(scrollableTHead:HTMLTableSectionElement,frozenTHead:HTMLTableSectionElement){
                let row = RowView.renderCells(this.columns,"th");
                scrollableTHead.appendChild(row);
                if((row as any).quic_frozen_row){
                    frozenTHead.appendChild((row as any).quic_frozen_row);
                }
            }
            protected buildTBody(scrollableTBody:HTMLTableSectionElement,frozenTBody:HTMLTableSectionElement){
                let rows = this.get_rows();
                let count = rows.length;
                for(let i=count;i<this.__count;i++){
                    let invalid = this.components[i];
                    invalid.dispose();
                    delete this.components[i];
                } 
                for(let i=0;i<count;i++){
                    let ds : IDataSource ;
                    if(i<this.__count){
                        this.components[i].dispose();
                    }
                    let rowView = new RowView(this,i,ds);
                    this.components[i] = rowView;
                    let row = rowView.render();
                    scrollableTBody.appendChild(row);
                    if((row as any).quic_frozen_row){
                        frozenTBody.appendChild((row as any).quic_frozen_row);
                    }
                }
                
            }
            
        }
        View.viewTypes.grid = GridView; 
    }
    
}