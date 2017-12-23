/// <reference path="../base/quic.observable.d.ts" />
/// <reference path="../base/quic.context.d.ts" />
/// <reference path="../models/quic.model.d.ts" />
/// <reference path="../quic.package.d.ts" />
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
            position?: string;
            validations?: {
                [index: string]: any;
            };
        }
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
            package: IPackage;
            protected _permission: string;
            protected _originPermission: string;
            protected _validatable?: boolean;
            protected _disabled?: Array<Node>;
            constructor(opts: ViewOpts, composite?: View, model?: Models.IModel, pack?: IPackage);
            id(): string;
            disabled(value?: boolean): boolean | this;
            permission(value?: string): any;
            readonly(value?: boolean): any;
            render(decoration?: boolean): HTMLElement;
            value(val?: any): any;
            dispose(): void;
            _T(key: string, returnRequired?: boolean): string;
            protected init(opts: ViewOpts, composite?: View, model?: Models.IModel, pack?: IPackage): void;
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
