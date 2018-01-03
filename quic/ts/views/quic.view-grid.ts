
/// <reference path="quic.view.ts" />
/// <reference path="quic.view-row.ts" />
/// <reference path="../quic.instance.ts" />

namespace Quic{
    export namespace Views{
        
        export interface GridViewOpts extends FormViewOpts{
            rows:any;
            total:any;
            pagesize?:number;
        }
        export class GridView extends FormView{
            $columns:{[index:string]:ColumnView};
            $opts:GridViewOpts;
            __count:number;
            __elems:any;
            constructor(opts:GridViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super(opts,composite,model,quic);
            }
            init(opts:GridViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                let fields = opts.fields;
                opts.fields = null;
                super.init(opts,composite,model,quic);
                opts.fields= fields;
                this.$columns={};
                for(let n in fields){
                    let columnOpts = fields[n];
                    if(!columnOpts.name)columnOpts.name = n;
                    let column = new ColumnView(columnOpts,this);
                    this.$columns[column.$name] = column;
                }
                this.$components = {};
                
            }


            render(decoration?:boolean):HTMLElement{
                let element = ctx.createElement("div");
                let title = this.$opts.title;
                let html = '<div class="quic-header"><span class="quic-caption">' + title + '</span><span class="quic-actions"></span></div>';
                html += '<div class="quic-body"><div class="quic-filter"></div><div class="quic-tb">'
                            +'<div class="quic-thead">'
                                +'<div class="quic-thead-frozen"><table><thead></thead></table></div>'
                                +'<div class="quic-thead-scrollable"><table><thead></thead></table></div>'
                            +'</div>'
                            +'<div class="quic-tbody">'+this._T("loading..")+'</div>'
                        +'</div></div>';
                html += '<div class="quic-footer"><span class="quic-status"></span><span class="quic-actions"></span></div>';
                element.innerHTML = html;
                let elems:any = this.__elems= {};
                elems.caption = element.firstChild.firstChild as HTMLElement;
                elems.headAtions = element.firstChild.lastChild;
                var body = elems.body = element.childNodes[1];
                elems.filter = body.firstChild;
                var tb = elems.tb = body.lastChild;
                elems.frozenTHead = tb.firstChild.firstChild.firstChild;
                elems.scrollableTHead = tb.firstChild.lastChild.firstChild;
                elems.tbody = tb.lastChild;
                elems.status = element.lastChild.firstChild;
                elems.footActions = element.lastChild.lastChild;
                elems.caption.innerHTML = title;

                let columns = this.$columns;
                let hrow:any = RowView.renderCells(columns,"th");
                if(hrow.quic_frozen_row)elems.frozenTHead.appendChild(hrow.quic_frozen_row);
                elems.scrollableTHead.appendChild(hrow);
                (<Models.IModel>this.$model.subscribe(()=>{
                    this.refresh();
                })).fetch();
                return element;
            }

            
            refresh(){
                let columns = this.$columns;
                let rows =this.get_rows();//= this.model.data;
                let html = '<div class="quic-tbody-frozen"><table><tbody></tbody></table></div>'
                +'<div class="quic-tbody-scrollable"><table><tbody></tbody></table></div>';
                let tbody = this.__elems.tbody;
                tbody.innerHTML = html;
                let frozenTBody:HTMLTableSectionElement = tbody.firstChild as HTMLTableSectionElement;
                let scrollableTBody:HTMLTableSectionElement = tbody.lastChild as HTMLTableSectionElement
                for(let i =0,j=rows.length;i<j;i++){
                    let rowDsOpts = {
                        data:rows[i]
                    };
                    let ds:any = new Models.Model(rowDsOpts);// = new DataSource(rowDsOpts,this.exprFactory);
                    let rowView = new RowView(this,i,ds);
                    let row = rowView.render();
                    scrollableTBody.appendChild(row);
                    if((row as any).quic_frozen_row){
                        frozenTBody.appendChild((row as any).quic_frozen_row);
                    }
                }          
            }

            get_rows():Array<object>{
                return this.$model.get_value();
            }
            get_total():number{
                throw "not implement";
            }
            protected buildTHead(scrollableTHead:HTMLTableSectionElement,frozenTHead:HTMLTableSectionElement){
                let row = RowView.renderCells(this.$columns,"th");
                scrollableTHead.appendChild(row);
                if((row as any).quic_frozen_row){
                    frozenTHead.appendChild((row as any).quic_frozen_row);
                }
            }
            protected buildTBody(scrollableTBody:HTMLTableSectionElement,frozenTBody:HTMLTableSectionElement){
                let rows = this.get_rows();
                let count = rows.length;
                let me :any= this;
                for(let i=count;i<this.__count;i++){
                    let invalid = this.$components[i];
                    invalid.dispose();
                    delete this.$components[i];
                    delete me[i];
                } 
                for(let i=0;i<count;i++){
                    let ds : any ;
                    if(i<this.__count){
                        this.$components[i].dispose();
                    }
                    let rowView = new RowView(this,i,ds);
                    this.$components[i] = rowView;
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