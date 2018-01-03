/// <reference path="quic.view.ts" />
namespace Quic{
    export namespace Views{
        export interface FormViewOpts extends ViewOpts{
            fields?:{[index:string]:ViewOpts};
            title?:string;
            commit_transport?:TransportOpts;
        }
        export class FormView extends View{
            private __disables:Array<Node>;

            $opts:FormViewOpts;
            $components:{[index:string]:View};
            
            constructor(opts:FormViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super(opts,composite,model,quic);
                this.$viewType = "form";
            }

            permission(value?:string):any{
                if(value===undefined) {
                    if(this.__permission===undefined){
                        if(this.$composite) this.__permission = this.__originPermission = (this.$composite.get_permission() || "validatable") as string;
                        else this.__permission = this.__originPermission ="validatable";
                    }
                    return this.__permission;
                }
                if(value!==this.__permission){
                    if(this.$element){
                        if(value==="disabled"){
                            return this.is_disabled(true);
                        }else {
                            this.is_disabled(false);
                        }
                        
                        if(value==="hidden"){
                            this.__permission = value;
                            this.$element.style.display="none";
                        }else{
                            this.__permission = value==="quic:rollback"?this.__originPermission:value;
                            let components = this.$components;
                            for(let n in components){
                                components[n].set_permission(value);
                            }
                        }
                        return this;
                    }else {
                        this.__permission = value==="quic:reset"?this.__originPermission:value;
                    }
    
                }
            }
            
            render(decoration?:boolean):HTMLElement{
                let element = ctx.createElement("div");
                this.$element = element;
                let id = this.$name;
                let title = this.$opts.title || this.$name;
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
                
                let components = this.$components;
                for(let viewname in components){
                    let childview = components[viewname];
                    let childElement = childview.render();
                    let position = childview.$opts.slot;
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
            validate(state?:any){
                let hasError = false;
                let result;
                for(let n in this.$components){
                    if((result =this.$components[n].validate(state))===false){
                        hasError = true;
                    }
                }
                return hasError?false:result;
            }
            waiting(block?:boolean){}
            submit(url:string):Promise{
                return new Promise((resolve,reject)=>{
                    let state = {};
                    if(this.validate(state)===false){
                        ctx.validateInfo(state).done(()=>{
                            reject(state,"validate");
                        });
                        return;
                    }
                    ctx.confirm(this._T("Do you want to submit?"),this._T("Confirm")).then((result)=>{
                        if(result===false){
                            reject(false,"cancel");
                        } else {
                            let value = this.get_value();
                            let transOpts:TransportOpts = this.$opts.commit_transport || {url:url};
                            transOpts.url = url;
                            if(!transOpts.method) transOpts.method = "POST";
                            if(!transOpts.dataType) transOpts.dataType="json";
                            if(!transOpts.type) transOpts.type = "json";
                            transOpts.data = value;
                            console.log("commiting",value);
                            this.waiting(true);
                            transport(transOpts).then(
                                (data)=>{this.waiting(false);resolve(data);ctx.message(this._T("Submit successfully."));},
                                (err,t)=>{ this.waiting(false);ctx.alert(this._T("Submit failed:" + err)); reject(err,"transport");}
                            );
                        }   
                    });
                });
                
            }
            protected render_visibleonly(decoration?:boolean):HTMLElement{
                return this.render(decoration);
            }
            protected render_writable(decoration?:boolean):HTMLElement{
                return this.render(decoration);
            }
            protected init(opts:FormViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super.init(opts, composite, model,quic);
                this.$components = {};
                if(opts.fields){
                    let compoments = this.$components ={};
                    let children = opts.fields;
                    let me :any= this;
                    for(let viewname in children){
                        let child :ViewOpts = children[viewname];
                        if(!child.name) child.name = viewname;
                        let viewType = child.viewType || child.dataType || "text";
                        let ViewCls :any = viewTypes[viewType] || viewTypes[viewType = "text"];
                        child.viewType = viewType;
                        if(opts.name && opts.name!=viewname){throw new Error("View name in opts is different from components");}
                        me[viewname] = compoments[viewname] = new ViewCls(child,this);
                    }
                }
            }
            
        }
        View.viewTypes.form = FormView; 
    }
}
exports.FormView = Quic.Views.FormView;