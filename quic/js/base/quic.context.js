var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="quic.promise.ts" />
/// <reference path="quic.transport.ts" />
var Quic;
(function (Quic) {
    var Exception = /** @class */ (function (_super) {
        __extends(Exception, _super);
        function Exception(message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _this = _super.call(this, message) || this;
            for (var i in args)
                _this[i] = args[i];
            return _this;
        }
        return Exception;
    }(Error));
    Quic.Exception = Exception;
    var head;
    var BrowserContext = /** @class */ (function () {
        function BrowserContext() {
            /**
             * 环境类型
             * browser,node
             * @type {string}
             * @memberof IContext
             */
            this.type = "browser";
            this.ajax = Quic.transport;
            this.warn = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return console.warn.apply(console, args);
            };
            this.error = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return console.error.apply(console, args);
            };
            this.info = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return console.log.apply(console, args);
            };
        }
        /**
         * 跳转浏览器的url
         *
         * @param {string} url 要跳转的url
         * @param {(doc?:HTMLDocument)=>void} complete 跳转完成后的回调??真的可以回调？？？？
         * @memberof IContext
         */
        BrowserContext.prototype.navigate = function (url, complete) {
            throw new Exception("Not implement");
        };
        /**
         * 调用ajax方法
         *
         * @param {*} opts
         * @returns {*}
         * @memberof IContext
         */
        BrowserContext.prototype.ajax = function (opts) {
            return Quic.transport(opts);
        };
        /**
         * 加载脚本
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof IContext
         */
        BrowserContext.prototype.loadScript = function (url, extras) {
            if (!head) {
                var heads = Quic.ctx.getElementsByTagName("head");
                head = heads[0];
            }
            var result = new Quic.Promise(function (resolve, reject) {
                var element = Quic.ctx.createElement("script");
                element.type = "text/script";
                element.src = url;
                element.onerror = function (ev) { return reject(ev); };
                if (element.onreadystatechange !== undefined) {
                    element.onreadystatechange = function (e) {
                        if (element.readyState === 'complete' || element.readyState === 4) {
                            var exports_1 = window["exports"];
                            window["exports"] = undefined;
                            head.removeChild(element);
                            resolve(exports_1);
                        }
                    };
                }
                else {
                    element.onload = function () {
                        var exports = window["exports"];
                        window["exports"] = undefined;
                        head.removeChild(element);
                        resolve(exports);
                    };
                }
                head.appendChild(element);
            });
            result.extras = extras;
            return result;
        };
        /**
         * 加载是样表
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof IContext
         */
        BrowserContext.prototype.loadCss = function (url, extras) {
            if (!head) {
                var heads = Quic.ctx.getElementsByTagName("head");
                head = heads[0];
            }
            var result = new Quic.Promise(function (resolve, reject) {
                var element = Quic.ctx.createElement("link");
                element.type = "text/css";
                element.href = url;
                element.rel = "stylesheet";
                element.onerror = function (ev) { return reject(ev); };
                if (element.onreadystatechange !== undefined) {
                    element.onreadystatechange = function (e) {
                        if (element.readyState === 'complete' || element.readyState === 4) {
                            var exports_2 = window["exports"];
                            window["exports"] = undefined;
                            head.removeChild(element);
                            resolve();
                        }
                    };
                }
                else {
                    element.onload = function () {
                        var exports = window["exports"];
                        window["exports"] = undefined;
                        head.removeChild(element);
                        resolve();
                    };
                }
                head.appendChild(element);
            });
            result.extras = extras;
            return result;
        };
        /**
         * 加载文本内容
         *
         * @param {string} url
         * @returns {IPromise}
         * @memberof IContext
         */
        BrowserContext.prototype.loadContent = function (url, extras) {
            return this.ajax({
                url: url,
                method: "GET"
            });
        };
        /**
         * 弹出一个警告框，icon为感叹号
         *
         * @param {string} message 要显示的提示信息
         * @param {string} [title] 标题
         * @returns {IPromise}
         * @memberof IContext
         */
        BrowserContext.prototype.alert = function (message, title) {
            return new Quic.Promise(function (resolve, reject) {
                window.alert(message);
                resolve(true);
            });
        };
        /**
         * 弹出一个确认框，icon为问号
         *
         * @param {string} message 要显示的确认信息
         * @param {string} [title]
         * @returns {IPromise}
         * @memberof IContext
         */
        BrowserContext.prototype.confirm = function (message, title) {
            return new Quic.Promise(function (resolve, reject) {
                resolve(window.confirm(message));
            });
        };
        BrowserContext.prototype.message = function (message, title) {
            return new Quic.Promise(function (resolve, reject) {
                window.alert(message);
                resolve(true);
            });
        };
        BrowserContext.prototype.validateInfo = function (state) {
            return new Quic.Promise(function (resolve, reject) {
                var message = "";
                for (var n in state) {
                    var err = state[n];
                    message += err.text + ": " + err.message + "\n";
                }
                window.alert(message);
                resolve(true);
            });
        };
        BrowserContext.prototype.validateInfo1 = function (state) {
            var ul = Quic.ctx.createElement("ul");
            for (var n in state) {
                var err = state[n];
                var li = Quic.ctx.createElement("li");
                li.innerHTML = "<label for='" + err.id + "'>" + err.text + "</label><span>" + err.message + "</span>";
                ul.appendChild(li);
                li.onclick = function (e) { };
            }
            return null;
        };
        /**
         * 创建Dom元素
         *
         * @param {string} tagName 元素标签
         * @returns {HTMLElement} 创建的元素对象
         * @memberof Dom
         */
        BrowserContext.prototype.createElement = function (tagName) {
            return document.createElement(tagName);
        };
        /**
         * 根据tagName获取文档
         *
         * @param {string} tagName
         * @param {string} context
         * @returns {Array<HTMLElement>}
         * @memberof Dom
         */
        BrowserContext.prototype.getElementsByTagName = function (tagName, context) {
            if (context)
                return context.getElementsByTagName(tagName);
            return document.getElementsByTagName(tagName);
        };
        /**
         * 给元素添加事件监听
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        BrowserContext.prototype.attach = function (element, evtname, listener) {
            if (element.addEventListener) {
                this.attach = function (element, evtname, listener) {
                    element.addEventListener(evtname, listener, false);
                };
            }
            else if (element.attachEvent) {
                this.attach = function (element, evtname, listener) {
                    element.attachEvent("on" + evtname, listener);
                };
            }
            else {
                throw new Exception("Browser is too old to run Quic");
            }
            return this.attach(element, evtname, listener);
        };
        /**
         * 移除元素上的事件监听
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} evtname 事件名
         * @param {Function} listener 监听函数
         * @memberof Dom
         */
        BrowserContext.prototype.detach = function (element, evtname, listener) {
            if (element.removeEventListener) {
                this.detach = function (element, evtname, listener) {
                    element.removeEventListener(evtname, listener, false);
                };
            }
            else if (element.detechEvent) {
                this.detach = function (element, evtname, listener) {
                    element.detechEvent("on" + evtname, listener);
                };
            }
            else {
                throw new Exception("Browser is too old to run Quic");
            }
            return this.detach(element, evtname, listener);
        };
        /**
         * 给元素添加css
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要添加的css
         * @memberof Dom
         */
        BrowserContext.prototype.addClass = function (element, css) {
            if (this.hasClass(element, css))
                return;
            element.className += " " + css;
        };
        /**
        * 移除元素上的css
        *
        * @param {HTMLElement} element 元素对象
        * @param {string} css 要移除的css
        * @memberof Dom
        */
        BrowserContext.prototype.removeClass = function (element, css) {
            var existed = element.className;
            if (!existed)
                return;
            var at = existed.indexOf(css);
            if (at < 0)
                return;
            var endAt = at + css.length;
            if (at === 0) {
                if (endAt < existed.length && !/\s/.test(existed[endAt]))
                    return;
            }
            else {
                if (!/\s/.test(existed[at - 1]))
                    return;
                at--;
                if (endAt < existed.length && !/\s/.test(existed[endAt]))
                    return;
            }
            var newCss;
            if (at > 0)
                newCss = existed.substring(0, at);
            if (endAt < existed.length) {
                var c = existed.substring(endAt);
                if (newCss)
                    newCss += c;
                else
                    newCss = c;
            }
            element.className = newCss;
        };
        /**
         * 检查元素上是否具有某个css
         *
         * @param {HTMLElement} element 元素对象
         * @param {string} css 要检测的css
         * @returns {boolean} 是否存在
         * @memberof Dom
         */
        BrowserContext.prototype.hasClass = function (element, css) {
            var existed = element.className;
            if (!existed)
                return false;
            var at = existed.indexOf(css);
            if (at < 0)
                return false;
            var endAt = at + css.length;
            if (at === 0) {
                if (endAt === existed.length || /\s/.test(existed[endAt]))
                    return true;
                return false;
            }
            else {
                if (!/\s/.test(existed[at - 1]))
                    return false;
                if (endAt === existed.length || /\s/.test(existed[endAt]))
                    return true;
                return false;
            }
        };
        BrowserContext.prototype.style = function (element, name, value) {
            if (window.getComputedStyle) {
                this.style = function (element, name, value) {
                    name = name.replace(/-[a-z]/g, function (e) { return e[1].toUpperCase(); });
                    if (value === undefined) {
                        return window.getComputedStyle(element, null)[name];
                    }
                    else {
                        element.style[name] = value;
                    }
                };
            }
            else {
                this.style = function (element, name, value) {
                    name = name.replace(/-[a-z]/g, function (e) { return e[1].toUpperCase(); });
                    if (value === undefined) {
                        return element.currentStyle[name];
                    }
                    else {
                        element.style[name] = value;
                    }
                };
            }
            this.style(element, name, value);
        };
        BrowserContext.prototype.opacity = function (element, value) {
            if (value === undefined) {
                var op = parseFloat(this.style(element, "opacity"));
                if (op === op)
                    return op;
                var filter = element.currentStyle["filter"];
                if (!filter)
                    return 1;
                var reg = /alpha\s*\(\s*(\d+)\s*\)/g;
                reg.lastIndex = 0;
                var match = reg.exec(filter);
                if (match) {
                    op = parseFloat(match[1]) / 100;
                }
                return op === op ? op : 1;
            }
            else {
                //filter: alpha(opacity=50);
                element.style.opacity = value.toString();
                element.style["filter"] = "alpha(opacity=" + (value * 100) + ")";
            }
        };
        BrowserContext.prototype.show = function (element, animation) {
            element.style.display = element.__quic_display || "";
        };
        BrowserContext.prototype.hide = function (element, animation) {
            var old = this.style(element, "display");
            if (old !== "none") {
                element.__quic_display = old;
            }
            element.style.display = "none";
        };
        return BrowserContext;
    }());
    Quic.ctx = new BrowserContext();
    Quic.configs = {};
})(Quic || (Quic = {}));
