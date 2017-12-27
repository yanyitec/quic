/// <reference path="quic.view.ts" />
namespace Quic{
    export namespace Views{
        export interface FormViewOpts extends ViewOpts{
            fields?:{[index:string]:ViewOpts};
            title?:string;
        }
        export class FormView extends View{
            private __disabled:Array<Node>;

            opts:FormViewOpts;
            components:{[index:string]:View};
            
            constructor(opts:FormViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super(opts,composite,model,quic);
                this.viewType = "form";
            }
            permission(value?:string):any{
                if(value===undefined) {
                    if(this._permission===undefined){
                        if(this.composite) this._permission = this._originPermission = (this.composite.permission() || "validatable") as string;
                        else this._permission = this._originPermission ="validatable";
                    }
                    return this._permission;
                }
                if(value!==this._permission){
                    if(this.element){
                        if(value==="disabled"){
                            return this.disabled(true);
                        }else {
                            this.disabled(false);
                        }
                        
                        if(value==="hidden"){
                            this._permission = value;
                            this.element.style.display="none";
                        }else{
                            this._permission = value==="quic:rollback"?this._originPermission:value;
                            let components = this.components;
                            for(let n in components){
                                components[n].permission(value);
                            }
                        }
                        return this;
                    }else {
                        this._permission = value==="quic:reset"?this._originPermission:value;
                    }
    
                }
            }
            
            render(decoration?:boolean):HTMLElement{
                let element = ctx.createElement("div");
                this.element = element;
                let id = this.name;
                let title = this.opts.title || this.name;
                title = this._T(title);
                let headAtions,content,bodyActions,status,footActions;
                if(decoration===false){
                    let html = "<div class='quic-content'></div><div class='quic-actions'></div>";
                    headAtions=bodyActions = footActions = element.lastChild;
                    content = status = element.firstChild;
                    
                }else {
                    let html = '<div class="quic-header"><span class="quic-caption">' + title + '</span><span class="quic-actions"></span></div>';
                    html += '<div class="quic-body"><div class="quic-content"></div><div class="quic-actions"></div></div>';
                    html += '<div class="quic-footer"><span class="quic-status"></span><span class="quic-actions"></span></div>';
                    element.innerHTML = html;
                    let caption = element.firstChild.firstChild as HTMLElement;
                    headAtions = element.firstChild.lastChild;
                    let body = element.childNodes[1];
                    content = body.firstChild;
                    bodyActions = body.lastChild;
                    status = element.lastChild.firstChild;
                    footActions = element.lastChild.lastChild;
                    caption.innerHTML = title;
                }
                
                let components = this.components;
                for(let viewname in components){
                    let childview = components[viewname];
                    let childElement = childview.render();
                    let position = childview.opts.position;
                    switch(position){
                        case "header":headAtions.appendChild(childElement);break;
                        case "status":status.appendChild(childElement); break;
                        case "footer":footActions.appendChild(childElement);break;
                        case "actions": bodyActions.appendChild(childElement);break;
                        default:content.appendChild(childElement);
                    }
                }
                return element;
            }
            protected render_visibleonly(decoration?:boolean):HTMLElement{
                return this.render(decoration);
            }
            protected render_writable(decoration?:boolean):HTMLElement{
                return this.render(decoration);
            }
    
            protected init(opts:FormViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super.init(opts, composite, model,quic);
                this.components = {};
                if(opts.fields){
                    let compoments = this.components ={};
                    let children = opts.fields;
                    for(let viewname in children){
                        let child :ViewOpts = children[viewname];
                        let viewType = child.viewType || child.dataType || "text";
                        let ViewCls :any = viewTypes[viewType] || viewTypes[viewType = "text"];
                        child.viewType = viewType;
                        if(opts.name && opts.name!=viewname){throw new Error("View name in opts is different from components");}
                        compoments[viewname] = new View(child,this);
                    }
                }
            }
            
        }
        View.viewTypes.form = FormView; 
    }
}
exports.FormView = Quic.Views.FormView;