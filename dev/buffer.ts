declare var Buffer;
export class BufferContactor{
    buffers:Array<any>;
    size:number;
    result:any;
    constructor(){
        this.buffers = [];
        this.size = 0;
    }
    concat(buffer){
        this.buffers.push(buffer);
        this.size = this.size + buffer.length;
        return this;
    }
    toBuffer():any{
        var data = null;
        var buffers = this.buffers;
        switch(buffers.length) {
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
        return data;
    }
    toString(){
        return Buffer.prototype.toString.apply(this.toBuffer(), arguments);
    }
}
