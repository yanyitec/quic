declare namespace Quic {
    let opts: {
        "validation-message-prefix": string;
    };
    class Exception extends Error {
        constructor(message: string, ...args: Array<any>);
    }
    function nextGNo(): number;
    let trim: (o: any) => string;
    let isArray: (o: any) => boolean;
    function isElement(node: any): any;
    function getExactType(o: any): string;
    function extend1(dest: any, src: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any): any;
    function array_index(arr: Array<any>, value: any): number;
    function deepClone(value: any): any;
    function extend(dest: any, src: any, overrite?: boolean): any;
}
