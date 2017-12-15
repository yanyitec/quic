declare namespace Quic {
    let opts: {
        "validation-message-prefix": string;
    };
    function nextGNo(): number;
    let trim: (o: any) => string;
    let isArray: (o: any) => boolean;
    function isElement(node: any): any;
    function getExactType(o: any): string;
    function extend(dest: any, src: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any): any;
    function array_index(arr: Array<any>, value: any): number;
    function str_replace(text: any, data?: any, accessorFactory?: AccessFactory): any;
}
