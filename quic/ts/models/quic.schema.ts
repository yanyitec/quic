namespace Quic{
    export namespace Models{
        // prop.myname[10][22].prop
        //root.prop(prop).prop(myname).index(10).index(22).prop(prop);
        export interface IOnProperty{
            (name:string,schema:ISchema,rootSchema:ISchema);
        }
        export interface ISchema{
            props:{[name:string]:ISchema};
            indexs:{[name:number]:ISchema};
            itemSchema:ISchema;
            prop(name:string):ISchema;
            index(nameOrIndex:string|number):ISchema;
            define(expr:string,onProperty?:IOnProperty):ISchema;
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
                let result = (this.props|| (this.props={}))[name];
                if(!result){
                    result = this.itemSchema || (this.itemSchema = new Schema("[quic:index]",this));
                    this.props[name]=result;
                    this.isObject=this.isArray=true;
                }
                return result;
            }
            define(expr:string,onProperty?:IOnProperty):ISchema{
                let at = 0;
                let lastDotAt:number=-1;
                let branceStartAt:number;
                let lastBranceEndAt:number;
                let schema:ISchema = this;
                for(let i=0,j=expr.length;i<j;i++){
                    let token = expr[i];
                    if(token==="."){
                        lastDotAt=i;
                        if(lastBranceEndAt===i-1){
                            continue;
                        }
                        let prop = expr.substring(lastDotAt+1,i-1);
                        if(prop==="$root"){
                            schema = this.root;
                        }else if(prop==="$parent"){
                            schema = schema.composite?schema.composite:schema;
                        }else if(prop){
                            schema = schema.prop(prop);
                            if(onProperty) onProperty(prop,schema,this);
                        }
                        
                    }else if(token==="["){
                        if(branceStartAt!==undefined){throw new Error("invalid schema path");} 
                        let prop = expr.substring(lastDotAt+1,i-1);
                        if(prop==="$root"){
                            schema = this.root;
                        }else if(prop==="$parent"){
                            schema = schema.composite?schema.composite:schema;
                        }else if(prop){
                            schema = schema.prop(prop);
                            if(onProperty) onProperty(prop,schema,this);
                        }
                        branceStartAt=i;
                    }else if(token==="]"){
                        if(branceStartAt!==undefined){throw new Error("invalid schema path");} 
                        let index = parseInt(expr.substring(branceStartAt+1,i-1));
                        if(index!=index) {throw new Error("invalid schema path");} 
                        branceStartAt=undefined;lastBranceEndAt=i;
                        schema = schema.index(index);
                        if(onProperty) onProperty(index.toString(),schema,this);
                    }
                }
                if(branceStartAt!==undefined){throw new Error("invalid schema path");} 
                let prop = expr.substring(lastDotAt+1);
                if(prop){
                    schema = schema.prop(prop);
                    if(onProperty) onProperty(prop,schema,this);
                };
                return schema;
            }
        }
        
        let empty:Schema;
    }
}
exports.Schema = Quic.Models.Schema;