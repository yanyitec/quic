export declare class $$TestFailException extends Error {
    constructor(message?: string, value1?: any, value2?: any, value3?: any);
}
export declare class $$TEST {
    static log(msg: string): void;
    static assert(msg: string): void;
    static run(obj: any, msg?: string, tab?: string): void;
    value?: any;
    constructor(value: any);
    prop(name: any, value?: any): $$TEST;
    length(len: number, message?: string): this;
    isNone(message?: string): $$TEST;
    isExists(message?: string): $$TEST;
    isEmpty(message?: string): $$TEST;
    notEmpty(message?: string): $$TEST;
    isZero(message?: string): $$TEST;
    notZero(message?: string): $$TEST;
    isNull(message?: string): $$TEST;
    notNull(message?: string): $$TEST;
    isUndefined(message?: string): $$TEST;
    notUndefined(message?: string): $$TEST;
    hasValue(message?: string): $$TEST;
    noValue(message?: string): $$TEST;
    isObject(message?: string): $$TEST;
    notObject(message?: string): $$TEST;
    isArray(message?: string): $$TEST;
    notArray(message?: string): $$TEST;
    isString(message?: string): $$TEST;
    notString(message?: string): $$TEST;
    isBool(message?: string): $$TEST;
    notBool(message?: string): $$TEST;
    isNumber(message?: string): $$TEST;
    notNumber(message?: string): $$TEST;
    instanceOf(...tp: Array<Function>): $$TEST;
    isEqual(other: any): $$TEST;
    notEqual(other: any): $$TEST;
    isSame(other: any): $$TEST;
    notSame(other: any): $$TEST;
    greaterThan(other: any): $$TEST;
    lessThan(other: any): $$TEST;
    greaterThanOrEqual(other: any): $$TEST;
    lessThanOrEqual(other: any): $$TEST;
}
