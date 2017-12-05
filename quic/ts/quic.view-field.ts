namespace Quic{
    
    

    export class FieldView extends View{
        constructor(quic:IQuic,composition:ICompositeView,field:IField,opts:FieldViewOpts){
            if(!field) ctx.throw("field is required","FieldView.constructor");
            super(quic,composition,field,opts);
        }
    }
    
}