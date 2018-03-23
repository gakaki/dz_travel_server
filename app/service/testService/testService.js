const Service = require('egg').Service;




class TestService extends Service {
    async ranking(uid,rankType){
        let ui ={
            uid:uid,
            nickName:"假装有名字",
            avatarUrl:"假装有头像",
        };

       await  this.ctx.service.redisService.redisService.init(ui);

        await this.ctx.model.TestModel.TestMatch.update({uid:uid},{$set:{
                uid: uid,
                rankType: rankType,
                date: new Date().toLocaleString(),
            }},{upsert:true});


        await this.app.redis.hmset(ui.uid, {rankType: rankType, startTime: new Date().getTime()});
        //添加到匹配池
        await this.app.redis.sadd("testmatchpool", ui.uid);
    }
    async matchSuccess(matchPoolPlayer){
        console.log("success");
        let rid = "99"+new Date().getTime();
        for(let player of matchPoolPlayer){
            await this.app.redis.srem("testmatchpool", player.uid);
            await this.ctx.model.TestModel.TestMatch.update({uid:player.uid},{$set:{
                    rid:rid
                }});
        }
        await this.ctx.service.redisService.redisService.initRoom(matchPoolPlayer, rid);
        await this.app.redis.sadd("testroomPool",rid);
    }

    async getMatchInfo(){
        return await this.ctx.model.TestModel.TestMatch.find();
    }
    async sendAnswer(player){
        let answers = JSON.parse(player.answers);

        let answer = "假装有答案";
        answers.push(answer);
        player.answer = answer;
        player.score = 1000;
        player.answers = JSON.stringify(answers);


        //更新用户信息
        await this.app.redis.hmset(player.uid, player);

    }



}


module.exports = TestService;