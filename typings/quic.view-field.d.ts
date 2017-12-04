/// <reference path="quic.d.ts" />
/// <reference path="quic.utils.d.ts" />
/// <reference path="quic.env.d.ts" />
/// <reference path="quic.dom.d.ts" />
declare namespace Quic {
    class FieldView extends View {
        constructor(quic: IQuic, composition: ICompositeView, field: IField, opts: FieldViewOpts);
    }
}
