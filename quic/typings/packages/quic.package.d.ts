/// <reference path="../views/quic.view.d.ts" />
declare namespace Quic {
    namespace Packages {
        interface IPackage extends IPromise {
            /**
             * 获取文本信息
             *
             * @param {string} key
             * @param {boolean} [returnRequired]
             * @memberof IQuic
             */
            /**
             * 字段定义
             *
             * @type {{[index:string]:any}}
             * @memberof IQuic
             */
            field_config(setting: string, includes?: {
                [index: string]: Views.ViewOpts;
            }, excludes?: Array<string>): any;
        }
        class Package extends Promise {
            fields: {
                [index: string]: Views.ViewOpts;
            };
            field_settings: {
                [index: string]: {
                    [index: string]: Views.ViewOpts;
                };
            };
            dynamic: boolean;
            constructor(opts: any);
            field_config(setting: string, includes?: {
                [index: string]: Views.ViewOpts;
            }, excludes?: Array<string>): {
                [index: string]: Views.ViewOpts;
            };
        }
    }
}
