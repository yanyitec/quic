"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BufferContactor = /** @class */ (function () {
    function BufferContactor() {
        this.buffers = [];
        this.size = 0;
    }
    BufferContactor.prototype.concat = function (buffer) {
        this.buffers.push(buffer);
        this.size = this.size + buffer.length;
        return this;
    };
    BufferContactor.prototype.toBuffer = function () {
        var data = null;
        var buffers = this.buffers;
        switch (buffers.length) {
            case 0:
                data = new Buffer(0);
                break;
            case 1:
                data = buffers[0];
                break;
            default:
                data = new Buffer(this.size);
                for (var i = 0, pos = 0, l = buffers.length; i < l; i++) {
                    var buffer = buffers[i];
                    buffer.copy(data, pos);
                    pos += buffer.length;
                }
                break;
        }
        // Cache the computed result
        this.result = data;
    };
    BufferContactor.prototype.toString = function () {
        return Buffer.prototype.toString.apply(this.toBuffer(), arguments);
    };
    return BufferContactor;
}());
exports.BufferContactor = BufferContactor;
