declare namespace Quic {
    class FieldsetView extends CompositeView implements FieldsetViewOpts, IFieldsetView {
        fieldset: IFieldset;
        quic: IQuic;
        includes?: {
            [fieldname: string]: FieldOpts;
        };
        excludes?: Array<string>;
        controller: IController;
        initData: {
            [index: string]: any;
        };
        currentData: {
            [index: string]: any;
        };
        constructor(quic: IQuic, pomposition: ICompositeView, field: IField, opts: ViewOpts);
    }
    function parseFieldOptsSet(includeExpr: string, excludes: Array<string>, defaultPermssion: string): {
        [index: string]: FieldOpts;
    };
}
