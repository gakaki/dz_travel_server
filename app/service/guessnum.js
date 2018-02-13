const Service = require('egg').Service;
const utils = require('./../utils/utils');
const nonce = require('./../utils/nonce');
const constant = require('./../utils/constant');
const configs=require('./../../config/configs');
const fs=require("fs");
const tenpay=require("tenpay");


module.exports =app =>{
    return class GuessNumService extends Service {
        async sendPack(ui,money,title,useTicket){
            this.logger.info("发红包的参数 :"+money+" "+title+" "+useTicket);
            let result={};

            let cost={
                ["items."+configs.configs().Item.ACCELERATION]:2
            };
            if(useTicket){
                cost  ["items."+configs.configs().Item.CASHCOUPON]=-1;
                money =1;
                if(ui.items[configs.configs().Item.CASHCOUPON] <= 0){
                    result.status=constant.Code.NEED_COUPON;
                    result.packInfo=null;
                    return result;
                }
            }
            //计算扣除

            //扣代金券
            //获得加速卡

         await this.ctx.model.User.update({uid:ui.uid},{$inc:cost});
         ui=await this.ctx.model.User.findOne({uid:ui.uid});
         await this.ctx.service.item.itemChange(ui,cost);
         let pack={
             pid:new Date().getTime(),
             uid:ui.uid,
             password:this.getCode(),
             money:Math.floor(money*100),
             remain:Math.floor(money*100),
             status:constant.Code.PACK_Fighing,
             title:title,
             useTicket:useTicket
         };
         let packInfo=await this.ctx.model.PackInfo.create(pack);
         this.logger.info("生成的红包信息 "+JSON.stringify(packInfo));
         packInfo.userInfo=ui;
         let that =this;
            setTimeout(async function () {
                that.logger.info("红包要过期了");
                let p = await that.ctx.model.PackInfo.findOne(packInfo.pid);
                p.status=constant.Code.PACK_EXPIRED;
                await that.ctx.model.PackInfo.update({pid:p.pid},p);
                if(!useTicket){
                    let recordsCount=await  that.ctx.model.PackGuessRecord.count({pid:p.pid});
                    if(recordsCount>0){
                        that.logger.info("有竞猜记录");
                        let cost={
                            ["items."+configs.configs().Item.MONEY]:p.remain,
                        };
                        that.ctx.model.User.update({uid:ui.uid},{$inc:cost});
                        ui=await this.ctx.model.User.findOne({uid:ui.uid});
                        that.ctx.service.item.itemChange(ui,cost);

                    }else{
                        that.logger.info("没有竞猜记录");
                        await that.refund(ui.pid,packInfo.orderId);
                    }
                }


            },Number(configs.configs().Parameter.Get("expire").value)*60*60*1000);
            result.packInfo=packInfo;
        return result;
        }


        async guessPack(ui,pack,guessNum,sid){
            let result={
                data:{}
            };
            let time= new Date(pack.createTime);
            if(time.getTime() +Number(configs.configs().Parameter.Get("expire").value)*60*60*1000 <= new Date().getTime()){
                result.code =constant.Code.PACK_EXPIRED;
                pack.status=constant.Code.PACK_EXPIRED;
                this.ctx.model.update({pid:pack.pid},pack);
                return result;
            }

            if(pack.status != constant.Code.PACK_Fighing){
                result.code = pack.status;
                return result;
            }

            if(pack.guessCount<=0){
                result.code = constant.Code.COUNT_OVER;
                pack.status =constant.Code.COUNT_OVER;
                this.ctx.model.update({pid:pack.pid},pack);
                return result;
            }


            if(pack.CDList[sid]){
                if(pack.CDList[sid]+Number(configs.configs().Parameter.Get("waitcd").value)*1000 >= new Date().getTime()){
                    result.code =constant.Code.PACK_ISCD;
                    result.data.restTime=new Date(pack.CDList[sid]+Number(configs.configs().Parameter.Get("waitcd").value)*1000-new Date().getTime()).toTimeString();
                    return result;
                }else{
                    delete pack.CDList[sid];
                }
            }



            let guessComp=this.guessCompare(guessNum,pack.password);
            let A = guessComp.A;
            let B = guessComp.B;
            let probability = 0;

            switch (A+B){
                case 4:
                    let cfgAAAA= configs.configs().Distribution.Get(4);
                    if(pack.AAAA){
                        probability = utils.Rangef(cfgAAAA.min,cfgAAAA.max);
                    }else{
                        probability = utils.Rangef(cfgAAAA.firstmin,cfgAAAA.firstmax);
                        pack.AAAA=true;
                    }
                    break;
                case 3:
                    let cfgAAA= configs.configs().Distribution.Get(3);
                    if(pack.AAA){
                        probability = utils.Rangef(cfgAAA.min,cfgAAA.max);
                    }else{
                        probability = utils.Rangef(cfgAAA.firstmin,cfgAAA.firstmax);
                        pack.AAA=true;
                    }
                    break;
                case 2:
                    let cfgAA= configs.configs().Distribution.Get(2);
                    if(pack.AA){
                        probability = utils.Rangef(cfgAA.min,cfgAA.max);
                    }else{
                        probability = utils.Rangef(cfgAA.firstmin,cfgAA.firstmax);
                        pack.AA=true;
                    }
                    break;
                case 1:
                    let cfgA= configs.configs().Distribution.Get(1);
                    if(pack.A){
                        probability = utils.Rangef(cfgA.min,cfgA.max);
                    }else{
                        probability = utils.Rangef(cfgA.firstmin,cfgA.firstmax);
                        pack.A=true;
                    }
                    break;
                case 0:
                    let cfg= configs.configs().Distribution.Get(5);
                    if(pack.miss){
                        probability = utils.Rangef(cfg.min,cfg.max);
                    }else{
                        probability = utils.Rangef(cfg.firstmin,cfg.firstmax);
                        pack.miss=true;
                    }
                    break;

            }
            this.logger.info("概率："+probability);
            this.logger.info("剩余金额："+pack.remain);

            let get = Math.floor(pack.money*probability);
            result.data.moneyGeted =get;
            this.logger.info("获取的金额："+get);
            if(A == 4){
                pack.status=constant.Code.PACK_FINSH;
                result.data.moneyGeted=Math.floor(pack.remain);
                this.logger.info("4A啦！！："+JSON.stringify(result));
            }


            result.data.mark=A+"A"+B+"B";
            result.data.markId=this.getMarkId(result.data.mark);
            let cid=utils.Rangei(1,4);
            switch (cid){
                case 1:
                    result.data.commit=configs.configs().Evaluate.Get(Number(result.data.markId)).iqwored1;
                    break;
                case 2:
                    result.data.commit=configs.configs().Evaluate.Get(Number(result.data.markId)).iqwored2;
                    break;
                case 3:
                    result.data.commit=configs.configs().Evaluate.Get(Number(result.data.markId)).iqwored3;
                    break;
            }
            let remain =pack.remain;
            let moneyGeted=result.data.moneyGeted;

            let rest=remain-moneyGeted;

            pack.remain =rest;
            this.logger.info("红包剩余:"+remain+" ;得到："+moneyGeted+"，剩余 ："+rest);

            pack.CDList[sid] = new Date().getTime();
            pack.guessCount -= 1;
            if(pack.guessCount == 0){
                pack.status=Code.COUNT_OVER;
            }
            await this.ctx.model.PackInfo.update({pid:pack.pid},pack);

            this.logger.info("竞猜后的红包："+JSON.stringify(pack));
            let packGuessRecord={
                uid:ui.uid,
                pid:pack.pid,
                userAnswerWord:guessNum,
                userGetMoney:moneyGeted,
                userMark:result.data.userMark,
                commit:result.data.commit
            };
            await this.ctx.model.PackGuessRecord.create(packGuessRecord);

            let delta = {
                ["items."+configs.configs().Item.MONEY]:moneyGeted,
            };
            await this.ctx.model.User.update({uid:ui.uid},{$inc:delta});

            ui=await this.ctx.model.User.findOne({uid:ui.uid});

            await this.ctx.service.item.itemChange(ui,delta);
            pack.userInfo=await this.ctx.model.User.findOne({uid:pack.uid});

            result.data.userAnswerWord=guessNum;
            result.data.packInfo=pack;
            result.data.userInfo=ui;
            result.code=constant.Code.OK;
            this.logger.info("准备返回的信息： "+JSON.stringify(result));
           return result
        }

        async clearCD(ui,pack,sid){
            let result={};
            if(pack.status != constant.Code.PACK_Fighing){
                result.code = pack.status;
                return result;
            }
            this.logger.info("剩余加速卡:"+ui.items[configs.configs().Item.ACCELERATION]);

            if(ui.items[configs.configs().Item.ACCELERATION] <= 0){
                result.code=constant.Code.NEED_ITEMS;
                return result;
            }
            let delta = {
                ["items."+configs.configs().Item.ACCELERATION]:-1
            };

            await this.ctx.model.User.update({uid:ui.uid},{$inc:delta});
            ui=await this.ctx.model.User.findOne({uid:ui.uid});
            this.logger.info("需要更新的用户信息 ："+JSON.stringify(ui));
            await this.ctx.service.item.itemChange(ui,delta);


            if(pack.CDList[sid]){
                if(pack.CDList[sid]+Number(configs.configs().Parameter.Get("waitcd").value)*1000 >= new Date().getTime()){
                    delete pack.CDList[sid];
                    this.logger.info("红包状况："+JSON.stringify(pack));
                    await this.ctx.model.PackInfo.update(pack);
                    result.code=constant.Code.OK;
                }else{
                    result.code = constant.Code.PACK_Fighing;
                }
            }else{
                result.code = constant.Code.PACK_Fighing;
            }

            return result;
        }
        async getPackRecords(ui,pack){
            let result={
                data:{}
            };
            result.data.originator=await this.ctx.model.User.findOne({uid:pack.uid});
            result.data.packPassword=pack.password;
            result.data.packInfo=pack;
            let records=await this.ctx.model.PackGuessRecord.find({pid:pack.pid});
            let rcs=await this.getRecords(records);

            result.data.records=rcs;
            result.code=constant.Code.OK;
            this.logger.info("红包猜题记录 ："+JSON.stringify(result));
            return result;
        }
        async getPackRankingList(ui,pack){
            let result={
                data:{}
            };
            pack.userInfo=await this.ctx.model.User.findOne({uid:pack.uid});
            result.data.packInfo=pack;
            result.data.answer=pack.password;

            let r = await this.ctx.model.PackGuessRecord.aggregate( [{$match: {pid: pack.pid,}}]).group({_id:"$uid",moneyGot:{$sum:"$userGetMoney"}}).sort({moneyGot: -1});

            let rankInfos= [];
            for(let record of r){
                let rankInfo={};
                rankInfo.uid=record._id;
                rankInfo.userInfo=await this.ctx.model.User.findOne({uid:record._id});
                rankInfo.moneyGot=record.moneyGot;
                let records = await this.ctx.model.PackGuessRecord.find({pid:pack.pid,uid:record._id});
                rankInfo.guessRecords=records;
                rankInfo.maxRecord=this.getMaxGuessRecord(records);
                rankInfos.push(rankInfo);
            }
            result.data.rank=rankInfos;
            result.code=constant.Code.OK;
            return result;
        }
        async getUserPackRecords(ui,pack,sendPage,sendLimit,receivePage,receiveLimit){
            let result={
                data:{}
            };
            let sendPackage={};
            let receivePackage={};

            let p= await this.getPackSumByUid(ui.uid);
            if(p == null){
                sendPackage.sum=0;
            }else{
                sendPackage.sum=p.sum;
            }

            sendPackage.num=await this.ctx.model.PackInfo.count({uid:ui.uid});
            sendPackage.record=await this.ctx.model.PackInfo.find({uid:ui.uid}).limit(sendLimit).skip((sendPage-1)*sendLimit).sort({"createTime":-1});

            let r =await this.getReceivePackageRecordsMoneyByUid(ui.uid);
            if(r == null){
                receivePackage.sum=0;
            }else{
                receivePackage.sum=r.moneyGot;
            }

            receivePackage.num=await this.ctx.model.PackGuessRecord.count({uid:ui.uid});
            receivePackage.record=await this.getReceivePackageRecordsByUid(ui.uid,receiveLimit,(receivePage-1)*receiveLimit,{"createTime":-1});
            result.data.sendPackages=sendPackage;
            result.data.receivePackages=receivePackage;
            result.code=constant.Code.OK;
            return result;
        }
        async getAcceleration(ui){
            let result={
                data:{}
            };
            let userShareRecord={
                uid:ui.uid
            };
           let createDate = new Date().toLocaleDateString();
            let count =await this.ctx.model.UserShareRecord.count({"uid":ui.uid,"createDate":createDate});
            if(count <1){
                let delta = {
                    ["items."+configs.configs().Item.ACCELERATION]:1
                };
                await this.ctx.model.User.update({uid:ui.uid},{$inc:delta});
                ui=await this.ctx.model.User.findOne({uid:ui.uid});
                await this.ctx.service.item.itemChange(ui,delta);

                userShareRecord.num=1;
                userShareRecord.getItem=true;
                userShareRecord.itemId=configs.configs().Item.ACCELERATION;
                result.code=constant.Code.OK;
            }else{
                result.code=constant.Code.PACK_ISSHARED;
                userShareRecord.num=0;
                userShareRecord.getItem=false;
                userShareRecord.itemId=configs.configs().Item.ACCELERATION;
            }

            this.ctx.model.UserShareRecord.create(userShareRecord);
            result.data=userShareRecord;
            return result;
        }


        getCode(){
            let psw=new Set();
            while (psw.size < 4) {
                psw.add(utils.Rangei(0, 9, true))
            }
            return Array.from(psw).join('');
        }

        guessCompare(guessNum,answer){
            let guessA=[...guessNum];
            let answerA=[...answer];
            let A=0;
            let B=0;
            for(let i=0;i<answerA.length;i++){
                for(let j=0;j<guessA.length;j++){
                    if(guessA[j] == answerA[i] && j == i){
                        A += 1;
                        break;
                    }else if(guessA[j]== answerA[i]){
                        B += 1;
                    }
                }
            }

            return {
                A:A,
                B:B
            };
        }

        getMarkId(mark){
            for(let i of configs.configs().evaluates){
                if(i[1]==mark){
                    return i[0];
                }
            }
        }

        getMaxGuessRecord(records){
            let recordsSort=records.sort(function(object1, object2) {
                let value1 = object1["userMark"];
                let value2 = object2["userMark"];
                return value2.localeCompare(value1);
            });

            return recordsSort[0];
        }
       async getPackSumByUid(uid){
            let r = await this.ctx.model.PackInfo.aggregate([{$match: {uid: uid,}}]).group({_id:"$uid",sum:{$sum:"$money"}}).limit(1);


            if(r &&r.length>0){
                return  r[0]
            }else{
                return null;
            }

        }

        async getReceivePackageRecordsMoneyByUid(uid){
            let r = await this.ctx.model.PackGuessRecord.aggregate([{
                $match: {uid: uid,}}]).group({_id:"$uid",moneyGot:{$sum:"$userGetMoney"}}).limit(1);

            if(r && r.length>0){
                return r[0];
            }else{
                return null;
            }
        }

        async getReceivePackageRecordsByUid(uid,limit,skip,sort){
            let ps= await this.ctx.model.PackGuessRecord.find({uid:uid},limit,skip,sort).limit(limit).skip(skip).sort(sort);
            let getPacks=[];
            for(let p of ps){
                let getPack={};
                let pack=await this.ctx.model.PackInfo.findOne(p.pid);
                if(pack!=null){
                    getPack.userInfo=await this.ctx.model.User.findOne(pack.uid);
                    getPack.guessInfo = p;
                    p.packInfo=pack;
                    getPacks.push(getPack);
                }
            }

            return getPacks
        }

        async refund(pid,orderId){
            let rechargeRecord =await this.ctx.model.RechargeRecord.findOne({"orderid":orderId});
            this.logger.info("查询下单记录 ："+JSON.stringify(rechargeRecord));
            if(rechargeRecord == null){
                return false;
            }
            let refund={};
            refund.pid=pid;
            refund.orderId=rechargeRecord.orderid;
            refund.total_fee=rechargeRecord.price;
            refund.out_refund_no=nonce.NonceAlDig(10);
            refund.refund_fee=rechargeRecord.price;
            refund.desc="红包退回";


            let res = await this.ReqUserRefund(refund);


            if(res == null){
                refund.success=false;
            }else{
                refund.success=true;
                refund.status=res.return_code;
                this.logger.info("退款人："+pid+"退款金额："+refund.total_fee+"退款状态："+res.return_code);
            }

            this.ctx.model.WechatRefundRecord.create(refund);

            return true;
        }

        async ReqUserRefund(m){
            const config = {
                appid: this.config.appid,
                mchid: this.config.pubmchid,
                partnerKey: this.config.pubkey,
                pfx: fs.readFileSync("./../../config/apiclient_cert.p12"),
                spbill_create_ip:(this.ctx.request.socket.remoteAddress).replace("::ffff:","")
            };
            const api = new tenpay(config);
            try{
                let result = await api.refund({
                    op_user_id:this.config.pubid,
                    out_refund_no:m.out_refund_no,
                    out_trade_no: m.orderId,
                    total_fee: m.total_fee,
                    refund_fee: m.refund_fee,
                });
                this.logger.info("退款结果 ："+JSON.stringify(result));
                return result;
            }catch (err){
                this.logger.error("退款失败:"+err);
                return null;
            }

        }

        async getRecords(records){
            let rcs=[];
            for(let record of records){
                let rc={};
                rc.userInfo=await this.ctx.model.User.findOne({uid:record.uid});
                rc.commit=record.commit;
                rc.userGetMoney=record.userGetMoney;
                rc.userAnswerWord=record.userAnswerWord;
                rcs.push(rc);
            }
            return rcs;
        }

    }
};

