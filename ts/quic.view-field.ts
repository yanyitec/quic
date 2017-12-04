/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />

namespace Quic{
    
    

    export class FieldView extends View{
        constructor(quic:IQuic,composition:ICompositeView,field:IField,opts:FieldViewOpts){
            if(!field) env.throw("field is required","FieldView.constructor");
            super(quic,composition,field,opts);
        }
    }
    
}