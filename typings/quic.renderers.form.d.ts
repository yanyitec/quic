/// <reference path="quic.d.ts" />
/// <reference path="quic.utils.d.ts" />
/// <reference path="quic.dom.d.ts" />
/// <reference path="quic.view.d.ts" />
/// <reference path="quic.field.d.ts" />
/// <reference path="quic.fieldset.d.ts" />
/// <reference path="quic.view-fieldset.d.ts" />
declare namespace Quic {
    function createFieldElement(view: IFieldView, viewset: IFieldsetView, quic: IQuic): HTMLElement;
}
