    app\nohm\model\questPool.js
    const nohm = require('nohm').Nohm;

    module.exports = app => {
      const QuestPool = nohm.model('QuestPool', {
        properties: {
          uid: {
              type: 'string',
          },
          prevtime: {
              type: 'integer',
          },
          events: {
              type: 'json',
              defaultValue: { items: [] },
          }
        },
      });
      return QuestPool;
    };


    async playloop(ctx){
        try{
            const questPool     = this.app.nohmModel.questPool;
            const ps            = new questPool();
            ps.id               = "myidforyou";
            let uid             = "abc";
            ps.uid              = uid;
            ps.prevtime         = 12312313;
            await ps.save$();
            const data          = await questPool.load$(ps.id);
            console.log(data);
            // await questPool.remove$(ps.id);
        }catch(e){
            console.log(e);
        }


        this.logger.info("[playloop]");
        let info                    = apis.PlayLoop.Init(ctx);
        await this.ctx.service.travelService.tourService.playloop(info);
        // info.submit();
    }