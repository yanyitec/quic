/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
/// <reference path="quic.fieldset.ts" />
/// <reference path="quic.view-fieldset.ts" />
var Quic;
(function (Quic) {
    function createForm(view) {
        let permission = view.permission;
        let module = view.module;
        let formSection = createSection(view.text || module._T(view.name), module);
        formSection.element.className = "quic-form " + view.CSS.css(permission);
        var views = view.components;
        let groupname;
        let section = formSection;
        for (let name in views) {
            let fieldview = views[name];
            //找到容器
            if (fieldview.group) {
                if (fieldview.group != groupname) {
                    groupname = fieldview.group;
                    section = createSection(groupname || module._T(groupname), module);
                    formSection.body.appendChild(section.element);
                }
                //else 保持原先的容器不变
            }
            else {
                section = formSection;
            }
            let containerElement = section[fieldview.position];
            if (!containerElement)
                containerElement = section.body;
            //创建元素
            let fieldElement = createFieldElement(fieldview, view, module);
            let cssor = fieldview.CSS[fieldview.permission];
            if (!cssor)
                Quic.env.throw("Invalid permission value", permission);
            fieldElement.className = "quic-field " + cssor.call(cssor);
            containerElement.appendChild(fieldElement);
        }
        return formSection.element;
        //var includes = view.includes || view.fieldset. 
    }
    function createSection(title, module) {
        let result = {};
        let groupElement = Quic.dom.createElement("div");
        result.element = groupElement;
        let headerArea = Quic.dom.createElement("div");
        headerArea.className = "quic-header";
        groupElement.appendChild(headerArea);
        result.header = headerArea;
        let bodyArea = Quic.dom.createElement("div");
        bodyArea.className = "quic-body";
        groupElement.appendChild(bodyArea);
        result.body = bodyArea;
        let footerArea = Quic.dom.createElement("div");
        footerArea.className = "quic-footer";
        groupElement.appendChild(footerArea);
        result.footer = footerArea;
        let headerTitle = Quic.dom.createElement("h3");
        headerTitle.className = "quic-title quic-header-title";
        headerTitle.innerHTML = title;
        headerArea.appendChild(headerTitle);
        result.header_title = headerTitle;
        let headerActions = Quic.dom.createElement("div");
        headerActions.className = "quic-actions quic-header-actions";
        headerArea.appendChild(headerActions);
        result.header_actions = headerActions;
        let footerStatus = Quic.dom.createElement("div");
        footerStatus.className = "quic-status quic-footer-status";
        footerArea.appendChild(footerStatus);
        result.footer_status = footerStatus;
        let footerActions = Quic.dom.createElement("div");
        footerActions.className = "quic-actions quic-footer-actions";
        footerArea.appendChild(footerActions);
        result.footer_actions = footerActions;
        return result;
    }
    function createFieldElement(view, viewset, module) {
        let field = view.field;
        let permission = view.permission;
        let render = this[permission];
        if (!render)
            throw new Error("Invalid permission value:" + permission);
        let input = render(view);
        if (view.nolabel)
            return input;
        let element = Quic.dom.createElement("div");
        if (permission === "hidden")
            element.style.display = "none";
        let id = "quic_input_" + Quic.nextGNo();
        let text = this.text || module._T(this.text) || module._T(this.name);
        let required = (permission === "validatable" && field.validationRule("required")) ? "<ins class='quic-field-required'>*</ins>" : "";
        element.innerHTML = `<label class="quic-field-caption" for="${id}">${text}${required}</label>`;
        let forcusElement = input["quic-label-focus-element"] || input;
        forcusElement.id = id;
        element.appendChild(input);
        let validInfos = field.validationTips();
        if (permission === "validatable" && validInfos) {
            let info = document.createElement("label");
            info.for = id;
            info.className = "quic-field-valid-tips";
            element.appendChild(info);
            let validTick;
            let ul = Quic.dom.createElement("ul");
            ul.className = "quic-validation-tips";
            for (let n in validInfos) {
                let li = Quic.dom.createElement("li");
                li.name = n;
                li.innerHTML = validInfos[n];
                ul.appendChild(li);
            }
            element["quic-validation-tips"] = ul;
            let valid = () => {
                if (validTick)
                    clearTimeout(validTick);
                validTick = 0;
                this.viewValidate(input);
            };
            let delayValid = () => {
                if (validTick)
                    clearTimeout(validTick);
                validTick = setTimeout(() => {
                    if (validTick)
                        clearTimeout(validTick);
                    validTick = 0;
                    this.viewValidate(input);
                }, 200);
            };
            Quic.dom.attach(forcusElement, "keydown", delayValid);
            Quic.dom.attach(forcusElement, "keyup", delayValid);
            Quic.dom.attach(forcusElement, "change", valid);
            Quic.dom.attach(forcusElement, "blur", valid);
        }
        return element;
    }
    Quic.createFieldElement = createFieldElement;
})(Quic || (Quic = {}));
