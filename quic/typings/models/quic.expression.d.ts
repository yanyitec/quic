declare namespace Quic {
    namespace Models {
        enum ExpressionTypes {
            const = 0,
            computed = 1,
            datapath = 2,
            mixed = 3,
        }
        interface AccessOpts {
            get_super: (data: any) => any;
            get_root: (data: any) => any;
        }
        class Expression {
            type: ExpressionTypes;
            text: string;
            protected constructor(type: ExpressionTypes, text: string);
            gothrough(onProp: (name: string, isArr: boolean, text: string) => void): void;
            getValue(data: any, accessOpts?: AccessOpts): any;
            getCode(asValue?: boolean): string;
            static parse(text: string, onProp?: (name: string, isArr: boolean, text: string) => void): Expression;
        }
        class MemberAccessExpression extends Expression {
            member: IMember;
            members: Array<IMember>;
            constructor(text: string, onProp?: (name: string, isArr: boolean, expr: Expression) => void);
            gothrough(onProp: (name: string, isArr: boolean, text: string) => void): void;
            getValue(data: any, accessOpts?: AccessOpts): any;
            getCode(asValue?: boolean): string;
        }
        class ComputedExpression extends Expression {
            paths: Array<MemberAccessExpression>;
            path: MemberAccessExpression;
            constructor(text: string, onProp?: (name: string, isArr: boolean, expr: Expression) => void);
            gothrough(onProp: (name: string, isArr: boolean, text: string) => void): void;
            getValue(data: any): any;
            getCode(asValue?: boolean): string;
        }
        class MixedExpression extends Expression {
            constructor(text: string, onProp: (name: string, isArr: boolean, text: string) => void);
            gothrough(onProp: (name: string, isArr: boolean, text: string) => void): void;
            getValue(data: any): any;
            getCode(asValue?: boolean): any;
            expr: Expression;
            exprs: Array<Expression>;
        }
        interface IParser {
            lastToken: string;
            lastTokenAt: number;
            inString: boolean;
        }
        interface IMember {
            name: string;
            isIndex?: boolean;
        }
        function expressionReader(text: string, parser: IParser): void;
        let ExpressionParser: (text: string, onProp?: (name: string, isArr: boolean, text: string) => void) => void;
        let MemberAccessParser: (text: string, onProp?: any) => void;
    }
}
