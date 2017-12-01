/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.datafield.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />

namespace Quic{
    export interface ViewsetOpts extends ViewOpts{

    }
    export interface ViewsetDefs extends ViewsetOpts,ViewDefs{
        
    }
    export interface ILocalizable{
        //多语言文本处理
        _T(text:string,mustReturn?:boolean);
    }
    export interface IViewset extends IView,ILocalizable,ViewsetDefs{
        
        
        
    }
}