declare namespace Quic {
    let opts: {
        "validation-message-prefix": string;
    };
    function nextGNo(): number;
    let arrRegx: RegExp;
    let trimRegx: RegExp;
    let urlRegx: RegExp;
    let emailRegx: RegExp;
    let intRegx: RegExp;
    let decimalRegx: RegExp;
    let trim: (o: any) => string;
    let isArray: (o: any) => boolean;
    function isElement(node: any): any;
    function getExactType(o: any): string;
    function extend(dest: any, src: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any): any;
    function array_index(arr: Array<any>, value: any): number;
    class AccessFactory implements IAccessFactory {
        caches: {
            [dataPath: string]: (data: {
                [index: string]: any;
            }, value?: any) => any;
        };
        constructor();
        create: (dataPath: string) => (data: {
            [index: string]: any;
        }, value?: any) => any;
        cached(dataPath: string): (data: {
            [index: string]: any;
        }, value?: any) => any;
        static create: (dataPath: string) => (data: {
            [index: string]: any;
        }, value?: any) => any;
        static cached(dataPath: string): (data: {
            [index: string]: any;
        }, value?: any) => any;
        static instance: AccessFactory;
    }
    function str_replace(text: any, data?: any, accessorFactory?: AccessFactory): any;
}
