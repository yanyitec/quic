var Quic;
(function (Quic) {
    function createForm(view) {
        var permission = view.permission;
        var module = view.quic;
        var formSection = createSection(view.text || module._T(view.name), module);
        formSection.element.className = "quic-form " + view.CSS.css(permission);
        var views = view.components;
        var groupname;
        var section = formSection;
        for (var name_1 in views) {
            var fieldview = views[name_1];
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
            var containerElement = section[fieldview.position];
            if (!containerElement)
                containerElement = section.body;
            //创建元素
            var fieldElement = createFieldElement(fieldview, view, module);
            var cssor = fieldview.CSS[fieldview.permission];
            if (!cssor)
                Quic.ctx.throw("Invalid permission value", permission);
            fieldElement.className = "quic-field " + cssor.call(cssor);
            containerElement.appendChild(fieldElement);
        }
        return formSection.element;
        //var includes = view.includes || view.fieldset. 
    }
    function createSection(title, quic) {
        var result = {};
        var groupElement = Quic.ctx.createElement("div");
        result.element = groupElement;
        var headerArea = Quic.ctx.createElement("div");
        headerArea.className = "quic-header";
        groupElement.appendChild(headerArea);
        result.header = headerArea;
        var bodyArea = Quic.ctx.createElement("div");
        bodyArea.className = "quic-body";
        groupElement.appendChild(bodyArea);
        result.body = bodyArea;
        var footerArea = Quic.ctx.createElement("div");
        footerArea.className = "quic-footer";
        groupElement.appendChild(footerArea);
        result.footer = footerArea;
        var headerTitle = Quic.ctx.createElement("h3");
        headerTitle.className = "quic-title quic-header-title";
        headerTitle.innerHTML = title;
        headerArea.appendChild(headerTitle);
        result.header_title = headerTitle;
        var headerActions = Quic.ctx.createElement("div");
        headerActions.className = "quic-actions quic-header-actions";
        headerArea.appendChild(headerActions);
        result.header_actions = headerActions;
        var footerStatus = Quic.ctx.createElement("div");
        footerStatus.className = "quic-status quic-footer-status";
        footerArea.appendChild(footerStatus);
        result.footer_status = footerStatus;
        var footerActions = Quic.ctx.createElement("div");
        footerActions.className = "quic-actions quic-footer-actions";
        footerArea.appendChild(footerActions);
        result.footer_actions = footerActions;
        return result;
    }
    function createFieldElement(view, viewset, quic) {
        var _this = this;
        var field = view.field;
        var permission = view.permission;
        var render = this[permission];
        if (!render)
            throw new Error("Invalid permission value:" + permission);
        var input = render(view);
        if (view.nolabel)
            return input;
        var element = Quic.ctx.createElement("div");
        if (permission === "hidden")
            element.style.display = "none";
        var id = "quic_input_" + Quic.nextGNo();
        var text = this.text || quic._T(this.text) || quic._T(this.name);
        var required = (permission === "validatable" && field.validationRule("required")) ? "<ins class='quic-field-required'>*</ins>" : "";
        element.innerHTML = "<label class=\"quic-field-caption\" for=\"" + id + "\">" + text + required + "</label>";
        var forcusElement = input["quic-label-focus-element"] || input;
        forcusElement.id = id;
        element.appendChild(input);
        var validInfos = field.validationTips();
        if (permission === "validatable" && validInfos) {
            var info = document.createElement("label");
            info.for = id;
            info.className = "quic-field-valid-tips";
            element.appendChild(info);
            var validTick_1;
            var ul = Quic.ctx.createElement("ul");
            ul.className = "quic-validation-tips";
            for (var n in validInfos) {
                var li = Quic.ctx.createElement("li");
                li.name = n;
                li.innerHTML = validInfos[n];
                ul.appendChild(li);
            }
            element["quic-validation-tips"] = ul;
            var valid = function () {
                if (validTick_1)
                    clearTimeout(validTick_1);
                validTick_1 = 0;
                _this.viewValidate(input);
            };
            var delayValid = function () {
                if (validTick_1)
                    clearTimeout(validTick_1);
                validTick_1 = setTimeout(function () {
                    if (validTick_1)
                        clearTimeout(validTick_1);
                    validTick_1 = 0;
                    _this.viewValidate(input);
                }, 200);
            };
            Quic.ctx.attach(forcusElement, "keydown", delayValid);
            Quic.ctx.attach(forcusElement, "keyup", delayValid);
            Quic.ctx.attach(forcusElement, "change", valid);
            Quic.ctx.attach(forcusElement, "blur", valid);
        }
        return element;
    }
    Quic.createFieldElement = createFieldElement;
})(Quic || (Quic = {}));
