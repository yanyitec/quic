namespace Quic{
    export class CompositeView extends View implements ICompositeView{
        components:{[viewname:string]:IView};
        constructor(quic:IQuic,pomposition:ICompositeView,field:IField,opts:ViewOpts){
            super(quic,pomposition,field,opts);
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