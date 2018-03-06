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

class Base  {
    constructor(){
    
    
        //prop type: string
        this.host = null;
    
        //prop type: string
        this.action = null;
    
        //prop type: string
        this.appName = null;
    
        //prop type: string[]
        this.reqFields = null;
    
        //prop type: string[]
        this.resFields = null;
        this.reqFields = [];
        this.resFields = [];
    }




   submit()  { 
        let tmp = {  } ;
        tmp.action=this.action;
        this.resFields.forEach(k =>  { 
           tmp[k]=this[k]
         } );

        this.ctx.body=tmp;
     } 



   parse(data)  { 
        Object.assign(this, data);
     } 

   error(err)  { 

     } 

}

class RankInfo extends Base {
    constructor(){
        super();
        this._rankType = null;
        this._limit = null;
        this._selfRank = null;
        this._ranks = null;
        this.reqFields = ["rankType","limit"];
        this.resFields = ["selfRank","ranks"];
    }
    //client input, require, type: RankType
    get rankType() {return this._rankType}
    

    //client input, optional, type: number
    get limit() {return this._limit}
    

    //server output, type: number
    set selfRank(v) {this._selfRank = v}
    

    //server output, type: RankItem[]
    set ranks(v) {this._ranks = v}
    



}

class RechargeRankInfo extends RankInfo {
    constructor(){
        super();
        this._myRecharge = null;
        this.reqFields = ["rankType","limit"];
        this.resFields = ["myRecharge","selfRank","ranks"];
    }
    //server output, type: number
    set myRecharge(v) {this._myRecharge = v}
    



}

//-------------exports---------------
exports.RankType = RankType;

exports.RankItem = RankItem;
exports.Base = Base;
exports.RankInfo = RankInfo;
exports.RechargeRankInfo = RechargeRankInfo;



