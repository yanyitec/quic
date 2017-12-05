

namespace Quic{
    interface ISection{
        element?:HTMLElement;
        header_title?:HTMLElement;
        header_actions?:HTMLElement;
        header?:HTMLElement;
        body?:HTMLElement;
        footer?:HTMLElement;
        footer_status?:HTMLElement;
        footer_actions?:HTMLElement;
    }
    function createForm(view:IFieldsetView){
       
        let permission = view.permission;
        let module = view.quic;
        let formSection:ISection = createSection( view.text || module._T(view.name),module);
        formSection.element.className = "quic-form " + view.CSS.css(permission);
        var views = view.components;
        
        let groupname:string;
        let section:ISection = formSection;
        
        for(let name in views){
            let fieldview :IFieldView = views[name] as IFieldView;
            //找到容器
            if(fieldview.group){
                if(fieldview.group!=groupname){
                    groupname = fieldview.group;
                    section = createSection(groupname || module._T(groupname),module); 
                    formSection.body.appendChild(section.element);
                }
                //else 保持原先的容器不变
            }else{
                section = formSection;
            }
            let containerElement:HTMLElement = (section as any)[fieldview.position];
            if(!containerElement) containerElement = section.body;
            
            //创建元素
            let fieldElement = createFieldElement(fieldview,view,module);
            let cssor = (fieldview.CSS as any)[fieldview.permission];
            if(!cssor) ctx.throw("Invalid permission value" , permission);
            fieldElement.className ="quic-field " + cssor.call(cssor);
            containerElement.appendChild(fieldElement);
        }
        return formSection.element;

        //var includes = view.includes || view.fieldset. 
    }
    function createSection(title:string,quic:IQuic):any{
        let result:ISection = {};
        let groupElement = ctx.createElement("div");
        result.element = groupElement;

        let headerArea = ctx.createElement("div");
        headerArea.className = "quic-header";
        groupElement.appendChild(headerArea);
        result.header = headerArea;

        let bodyArea = ctx.createElement("div");
        bodyArea.className = "quic-body";
        groupElement.appendChild(bodyArea);
        result.body = bodyArea;

        let footerArea = ctx.createElement("div");
        footerArea.className = "quic-footer";
        groupElement.appendChild(footerArea);
        result.footer = footerArea;

        let headerTitle = ctx.createElement("h3");
        headerTitle.className = "quic-title quic-header-title";
        headerTitle.innerHTML = title;
        headerArea.appendChild(headerTitle);
        result.header_title = headerTitle;

        let headerActions = ctx.createElement("div");
        headerActions.className = "quic-actions quic-header-actions";
        headerArea.appendChild(headerActions);
        result.header_actions = headerActions;

        let footerStatus = ctx.createElement("div");
        footerStatus.className = "quic-status quic-footer-status";
        footerArea.appendChild(footerStatus);
        result.footer_status = footerStatus;

        let footerActions = ctx.createElement("div");
        footerActions.className = "quic-actions quic-footer-actions";
        footerArea.appendChild(footerActions);
        result.footer_actions = footerActions;

        return result;
    }
    export function createFieldElement(view:IFieldView,viewset:IFieldsetView,quic:IQuic):HTMLElement{
        let field = view.field;
        let permission = view.permission;
        let render : IRender = (this as any)[permission];
        if(!render) throw new Error("Invalid permission value:" + permission);
        let input = render(view);
        if(view.nolabel) return input;
        

        let element = ctx.createElement("div");
        if(permission==="hidden")element.style.display="none";
        let id = "quic_input_"+(Quic as any).nextGNo();
        let text = this.text || quic._T(this.text) || quic._T(this.name);
        let required = (permission==="validatable" && field.validationRule("required"))?"<ins class='quic-field-required'>*</ins>":"";
        element.innerHTML = `<label class="quic-field-caption" for="${id}">${text}${required}</label>`;
        
        let forcusElement = input["quic-label-focus-element"]||input;
        forcusElement.id= id;
        element.appendChild(input);
        let validInfos = field.validationTips();
        if(permission==="validatable" && validInfos){
            let info = document.createElement("label") as HTMLLabelElement;
            (info as any).for = id;
            info.className="quic-field-valid-tips";
            element.appendChild(info);
            
            let validTick;
            let ul:HTMLUListElement = ctx.createElement("ul") as HTMLUListElement;
            ul.className="quic-validation-tips";
            for(let n in validInfos){
                let li = ctx.createElement("li");
                (li as any).name = n;
                li.innerHTML = validInfos[n];
                ul.appendChild(li);
            }
            (element as any)["quic-validation-tips"]=ul;
            let valid =()=>{
                if(validTick) clearTimeout(validTick);
                validTick=0;
                this.viewValidate(input);
            };
            let delayValid = ()=>{
                if(validTick) clearTimeout(validTick);
                validTick = setTimeout(() => {
                    if(validTick) clearTimeout(validTick);
                    validTick=0;
                    this.viewValidate(input);
                    
                }, 200);
            }
            ctx.attach(forcusElement,"keydown",delayValid);
            ctx.attach(forcusElement,"keyup",delayValid);
            ctx.attach(forcusElement,"change",valid);
            ctx.attach(forcusElement,"blur",valid);
        }
        
        return element;
    }
}