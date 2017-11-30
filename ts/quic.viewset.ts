/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.datafield.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />

namespace Quic{
    export interface ViewsetOpts extends ViewOpts{
        
    }
    export interface IViewset extends IView,ViewsetOpts{
        //多语言文本处理
        _T(text:string,mustReturn?:boolean);
        //数据访问器
        accessorFactory:DataAccessorFactory;

        fieldValue(fieldOpts:FieldOpts,fieldElement:HTMLElement,data:any,value?:any):any;
    }
}