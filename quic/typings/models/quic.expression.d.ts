/// <reference path="quic.schema.d.ts" />
declare namespace Quic {
    namespace Models {
        enum ExpressionTypes {
            const = 0,
            computed = 1,
            datapath = 2,
            mixed = 3,
        }
        interface IAccess {
            (data: any, value?: any): any;
            type?: ExpressionTypes;
            expr?: Expression;
            schema?: ISchema;
            text?: string;
            root?: ISchema;
            isDataPath?: boolean;
            deps?: Array<ISchema>;
        }
        class Expression {
            type: ExpressionTypes;
            text: string;
            genAccess: (rootSchema: ISchema) => IAccess;
            protected constructor(type: ExpressionTypes, text: string);
            static parse(text: string): Expression;
        }
        class DataPathExpression extends Expression {
            constructor(text: string);
        }
        class ComputedExpression extends Expression {
            paths: Array<DataPathExpression>;
            path: DataPathExpression;
            constructor(text: string);
        }
        class MixedExpression extends Expression {
            constructor(text: string, exprs: Array<Expression>);
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
    }
}
