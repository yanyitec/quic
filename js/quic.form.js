/// <reference path="quic.field.ts" />
var Quic;
(function (Quic) {
    var Form = /** @class */ (function () {
        function Form() {
        }
        Form.prototype.get_data = function () {
            return null;
        };
        Form.prototype.waiting = function (msg) { };
        Form.prototype._T = function (key) {
            return key;
        };
        return Form;
    }());
    Quic.Form = Form;
})(Quic || (Quic = {}));
