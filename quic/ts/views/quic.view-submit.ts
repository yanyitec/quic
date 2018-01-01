/// <reference path="quic.view.ts" />
/// <reference path="quic.view-form.ts" />
namespace Quic{
    export namespace Views{
        export interface SubmitViewOpts extends ViewOpts{
            url?:string;
        }
        export class SubmitView extends View{
            $url:string;
            constructor(opts:SubmitViewOpts,composite?:View,model?:Models.IModel,quic?:IQuicInstance){
                super(opts,composite,model,quic);
                this.$viewType = "submit";
                this.$url = opts.url;
                this.$decoration= false;
            }
            render_visibleonly():HTMLElement{
                let element:HTMLInputElement = ctx.createElement("input") as HTMLInputElement;
                element.type="submit";
                element.value = this.$text;
                element.disabled = true;
                return element;
            }
            
            render_writable():HTMLElement{
                let element:HTMLInputElement = ctx.createElement("input") as HTMLInputElement;
                element.type="submit";
                element.value = this.$text;
                ctx.attach(element,"click",(evt:any)=>{
                    evt ||(evt=event);
                    let form:any = this;
                    while(form){
                        form=(<View>form).$composite;
                        if((<View>form) instanceof FormView){
                            break;
                        }
                    }
                    if(!form) throw new Exception("Cannot find form to submit");
                    element.disabled = true;
                    let url:string;
                    if(this.$url) url = this.$model.find(this.$url).get_value();
                    (<FormView>form).submit(url||"").then(
                        (data)=>{element.disabled=true;}
                        ,(err)=>element.disabled = true
                    );
                });
                return element;
            }            
        }
        View.viewTypes.submit = SubmitView; 
    }
}
exports.FormView = Quic.Views.FormView;