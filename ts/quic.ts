
export class Quic{
    constructor(opts:any){

    }
    static nextGNo():number{
        if(id_seed++>2100000000) id_seed= -2100000000;
        return id_seed;
    }
}
let id_seed:number = 10000;
