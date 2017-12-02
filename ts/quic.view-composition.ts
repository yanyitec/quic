namespace Quic{
    export class CompositeView extends View implements ICompositeView{
        components:{[viewname:string]:IView};
        constructor(module:IModule,pomposition:ICompositeView,field:IField,opts:ViewOpts){
            super(module,pomposition,field,opts);
            this.components={};
        }
        
        close(){
            
            throw "Not implement";
        }
        dispose(){
            this.close();
        }
        
        
    }

}