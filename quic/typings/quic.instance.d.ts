/// <reference path="models/quic.model.d.ts" />
/// <reference path="models/quic.schema.d.ts" />
/// <reference path="views/quic.view.d.ts" />
/// <reference path="packages/quic.package.d.ts" />
declare namespace Quic {
    interface IController {
        $quic?: IQuicInstance;
        $model?: Models.IModel;
        $view?: Views.View;
        $opts?: QuicOpts;
        initing?: (opts: QuicOpts, quic: IQuicInstance) => void;
        created?: (model: Models.IModel, view: Views.View, quic: IQuicInstance) => void;
        binding?: (data: any, reason: string, quic: IQuicInstance) => void;
    }
    interface QuicOpts extends Models.ModelOpts {
        element: HTMLElement;
        fields: any;
        includes: any;
        excludes: any;
        model: any;
        viewType: string;
        setting: string;
        permission?: string;
        controller: IController;
    }
    interface IQuicInstance extends IObservable, IController {
        _T(key: string, valueRequired?: boolean): string;
        package: Packages.IPackage;
        opts: QuicOpts;
        model: Models.IModel;
        view: Views.View;
        controller: IController;
        element: HTMLElement;
        fields: {
            [index: string]: Views.ViewOpts;
        };
    }
    class QuicInstance extends Promise implements IQuicInstance {
        package: Packages.IPackage;
        opts: QuicOpts;
        model: Models.IModel;
        view: Views.View;
        controller: IController;
        element: HTMLElement;
        fields: {
            [index: string]: Views.ViewOpts;
        };
        subscribe: (name: string, lisenter: Function) => any;
        unsubscribe: (name: string, lisenter: Function) => any;
        notify: (name: string, evt?: any, applyInvo?: any, other?: any) => any;
        constructor(opts: QuicOpts, pack: Packages.IPackage);
        _T(key: string, valueRequired?: boolean): string;
    }
}
