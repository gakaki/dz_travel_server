//-------------enums---------------

class RankType{
    
    static get DAY() { return 1;}
    
    static get MONTH() { return 3;}
    
    static get RECHARGE() { return 9;}
    
}

//------------classes--------------

class RankItem  {
    constructor(){
    
        //prop type: string
        this.name = null;
    
        //prop type: number
        this.rank = null;
    
        this.reqFields = [];
        this.resFields = [];
    }


}

class RankInfo  {
    constructor(){
    
        this._rankType = null;
        this._limit = null;
        this._selfRank = null;
        this._ranks = null;
        this.reqFields = ["rankType","limit"];
        this.resFields = ["selfRank","ranks"];
    }
    //client input, require, type: RankType
    get rankType() {return this._rankType}
    set rankType(v) {this._rankType = v}

    //client input, optional, type: number
    get limit() {return this._limit}
    set limit(v) {this._limit = v}

    //server output, type: number
    get selfRank() {return this._selfRank}
    set selfRank(v) {this._selfRank = v}

    //server output, type: RankItem[]
    get ranks() {return this._ranks}
    set ranks(v) {this._ranks = v}



}

class Base  {
    constructor(){
    
        //prop type: string
        this.appName = null;
    
        //prop type: string
        this.action = null;
    
        this.reqFields = [];
        this.resFields = [];
    }






   submit()  { 
        let tmp = { };
        tmp.action=this.action;
        this.resFields.forEach(k =>  { 
           tmp[k]=this[k]
        });

        this.ctx.body=tmp;
    }



   parse(data)  { 
        Object.assign(this, data);
    }

   error(err)  { 

    }

}

class RechargeRankInfo extends RankInfo {
    constructor(){
        super();
        this._myRecharge = null;
        this.reqFields = ["rankType","limit"];
        this.resFields = ["myRecharge","selfRank","ranks"];
    }
    //server output, type: number
    get myRecharge() {return this._myRecharge}
    set myRecharge(v) {this._myRecharge = v}



}

//-------------exports---------------
exports.RankType = RankType;

exports.RankItem = RankItem;
exports.RankInfo = RankInfo;
exports.Base = Base;
exports.RechargeRankInfo = RechargeRankInfo;



