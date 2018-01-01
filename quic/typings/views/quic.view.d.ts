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
            decoration?: boolean;
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
            decoration: boolean;
            position: boolean;
            validations: boolean;
            events: boolean;
        };
        interface ILocalizable {
        }
        class View extends Observable {
            $name: string;
            $dataType: string;
            $viewType: string;
            $validations: {
                [index: string]: string;
            };
            $text: string;
            $description: string;
            $decoration: boolean;
            $idprefix: string;
            $css: string;
            $width?: number;
            $element: HTMLElement;
            $composite: View;
            $opts: ViewOpts;
            $model: Models.IModel;
            $quic: IQuicInstance;
            protected __permission: string;
            protected __originPermission: string;
            protected __validatable?: boolean;
            protected __disabled?: Array<Node>;
            constructor(opts: ViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance);
            get_viewid(): string;
            get_value(): any;
            set_value(value?: any): any;
            validate(state?: any): boolean;
            is_disabled(value?: boolean): boolean | this;
            get_permission(): string;
            set_permission(value?: string): any;
            is_readonly(value?: boolean): any;
            render(decoration?: boolean): HTMLElement;
            dispose(): void;
            _T(key: string): string;
            protected init(opts: ViewOpts, composite?: View, model?: Models.IModel, quic?: IQuicInstance): void;
            protected render_visibleonly(decoration?: boolean): HTMLElement;
            protected render_writable(decoration?: boolean): HTMLElement;
            protected setPermissionCss(perm: string): View;
            static viewTypes: {
                [index: string]: any;
            };
            static validators: {
                [index: string]: any;
            };
        }
        let viewTypes: {
            [index: string]: any;
        };
        let validators: {
            [index: string]: any;
        };
    }
}
