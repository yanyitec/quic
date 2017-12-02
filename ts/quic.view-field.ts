/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />

namespace Quic{
    
    

    export class FieldView extends View{
        constructor(module:IModule,composition:ICompositeView,field:IField,opts:FieldViewOpts){
            if(!field) env.throw("field is required","FieldView.constructor");
            super(module,composition,field,opts);
        }
    }
    
}