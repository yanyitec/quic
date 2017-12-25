/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="quic.expression.ts" />
/// <reference path="../quic.package.ts" />

namespace Quic{
    export namespace Models{
        // prop.myname[10][22].prop
        //root.prop(prop).prop(myname).index(10).index(22).prop(prop);
        export interface IOnProperty{
            (name:string,schema:ISchema,reset?:boolean);
        }
        export interface DefineOpts{
            expression:Expression;
            text:string;
            schema :ISchema;
        }
        export interface ISchema{
            props:{[name:string]:ISchema};
            indexs:{[name:number]:ISchema};
            itemSchema:ISchema;
            prop(name:string):ISchema;
            index(nameOrIndex:string|number):ISchema;
            find(expr:string,onProperty?:IOnProperty):ISchema;
            parse(expr:string,onProperty?:IOnProperty):DefineOpts;
            name:string|number;
            composite:ISchema;
            isArray:boolean;
            isObject:boolean;
            root:Schema;
        }
        export interface ISchemaValuechangeListener{
            (value:any,data:any,trigger:ISchema,evtArgs:any):any;
        }
        export class Schema implements ISchema{
            props:{[name:string]:ISchema};
            indexs:{[name:number]:ISchema};
            name:string|number;
            composite:ISchema;
            itemSchema :ISchema;
            isArray:boolean;
            isObject :boolean;
            root:Schema;
            __defines:{[index:string]:DefineOpts};
            constructor(name:string="$ROOT",composite?:ISchema){
                this.name = name;
                this.composite = composite;
                if(composite){
                    this.root = composite.root;
                }else {
                    this.root = this;
                }
            }

            prop(name:string):ISchema{
                let result = (this.props|| (this.props={}))[name];
                if(!result){
                    this.props[name]=new Schema(name,this);
                    this.isObject=true;
                }
                return result;
            }
            index(name:string):ISchema{
                let result:ISchema;
                if(name===""){
                    result = this.itemSchema;
                }else {
                    result = (this.props|| (this.props={}))[name];
                }
                
                if(!result){
                    result = this.itemSchema || (this.itemSchema = new Schema("[quic:index]",this));
                    if(name)this.props[name]=result;
                    this.isObject=this.isArray=true;
                }
                return result;
            }
            find(text:string,onProperty?:IOnProperty):ISchema{
                let exprs = this.__defines ||(this.__defines={});
                let def :DefineOpts = exprs[text];
                let schema :ISchema = this;
                if(!def){
                    let expr = new MemberAccessExpression(text,(name,isArray)=>{
                        if(name==="$ROOT"){
                            schema = schema.root;
                        }else if(name==="$SUPER"){
                            if(schema.composite) schema = schema.composite;
                            else throw new Error("invalid expression,no more $SUPER:"+text);
                        }else {
                            if(isArray){
                                schema.index(name);
                            }else {
                                schema.prop(name);
                            }
                        }
                        if(onProperty) onProperty(name,schema);
                    });
                    def = {
                        text:text,
                        schema:schema,
                        expression:expr
                    };
                }else { 
                    for(let i in (def.expression as MemberAccessExpression).members){
                        let member = (def.expression as MemberAccessExpression).members[i];
                        if(member.name==="$ROOT"){
                            schema = schema.root;
                        }else if(member.name==="$SUPER"){
                            if(schema.composite) schema = schema.composite;
                            else throw new Error("invalid expression,no more $SUPER:"+text);
                        }else {
                            if(member.isIndex){
                                schema = schema.index(member.name);
                            }else {
                                schema = schema.prop(member.name);
                            }
                        }
                        if(onProperty) onProperty(member.name,schema);
                    }
                }
                return schema;
            }
            parse(text:string,onProperty?:IOnProperty):DefineOpts{
                let exprs = this.__defines ||(this.__defines={});
                let def :DefineOpts = exprs[text];
                if(def) return def;
                let schema :ISchema = this;
                let oldText :string;
                let reset = false;
                let onProp =(name:string,isArr:boolean,text:string)=>{
                    if(text!=oldText){
                        schema = this;
                        oldText = text;
                        reset=true;
                    }
                    if(name==="$ROOT"){
                        schema = schema.root;
                    }else if(name==="$SUPER"){
                        if(schema.composite) schema = schema.composite;
                        else throw new Error("invalid expression,no more $SUPER:"+text);
                    }else {
                        if(isArr){
                            schema = schema.index(name);
                        }else {
                            schema = schema.prop(name);
                        }
                    }
                    if(onProperty) onProperty(name,schema,reset);
                    reset = false;
                };
                if(!def){
                    let expr = Expression.parse(text,onProp);
                    if(!(expr as ComputedExpression).path) {
                        schema = undefined;
                    }
                    def = this.__defines[text] = {
                        text:text,
                        schema:schema,
                        expression:expr
                    };
                }else {
                    def.expression.gothrough(onProp);
                }
                return def;
            }
        }
        
        let empty:Schema;
    }
}
exports.Schema = Quic.Models.Schema;