/// <reference path="../base/quic.utils.d.ts" />
/// <reference path="../base/quic.observable.d.ts" />
/// <reference path="../base/quic.context.d.ts" />
/// <reference path="../models/quic.model.d.ts" />
/// <reference path="../quic.instance.d.ts" />
declare namespace Quic {
    namespace Views {
        interface ViewOpts {
            perm?: string;
            datapath?: string;
            text?: string;
            template?: (data: any, permissionType: string) => HTMLElement | string;
            css?: string;
            dataType?: string;
            viewType?: string;
            name?: string;
            desciption?: string;
            slot?: string;
            validations?: {
                [index: string]: any;
            };
            events?: {
                [index: string]: Function;
            };
        }
        let viewOptsKeymembers: {
            perm: boolean;
            datapath: boolean;
            text: boolean;
            template: boolean;
            css: boolean;
            dataType: boolean;
            viewType: boolean;
            desciption: boolean;
            position: boolean;
            validations: boolean;
            events: boolean;
        };
        interface ILocalizable {
        }
        class View extends Observable {
            name: string;
            dataType: string;
            viewType: string;
            validations: {
                [index: string]: string;
            };
            text: string;
            description: string;
            idprefix: string;
            css: string;
            width?: number;
            element: HTMLElement;
            composite: View;
            opts: ViewOpts;
            model: Models.IModel;
            quic: IQuicInstance;
            protected _permission: string;
            protected _originPermission: string;
            protected _validatable?: boolean;
            protected _disabled?: Array<Node>;
            constructor(opts: ViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance);
            id(): string;
            value(value?: any): any;
            disabled(value?: boolean): boolean | this;
            permission(value?: string): any;
            readonly(value?: boolean): any;
            render(decoration?: boolean): HTMLElement;
            dispose(): void;
            _T(key: string): string;
            protected init(opts: ViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance): void;
            protected render_visibleonly(decoration?: boolean): HTMLElement;
            protected render_writable(decoration?: boolean): HTMLElement;
            protected setPermissionCss(perm: string): View;
            static clone(src: View, cloneView: View, composite?: View, model?: Models.IModel): View;
            static viewTypes: {
                [index: string]: any;
            };
        }
        let viewTypes: {
            [index: string]: any;
        };
    }
}
