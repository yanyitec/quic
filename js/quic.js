export class Quic {
    constructor(opts) {
    }
    static nextGNo() {
        if (id_seed++ > 2100000000)
            id_seed = -2100000000;
        return id_seed;
    }
}
let id_seed = 10000;
