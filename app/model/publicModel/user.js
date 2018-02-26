
module.exports = app => {
    const mongoose = app.mongoose;
    const UserSchema = new mongoose.Schema({
        pid: { type: String  },//平台号
        uid: { type: String  },//如果是第三方登陆，则返回UID
        appName: { type: String  },//小程序名称
        nickName: { type: String  },//用户名
        avatarUrl: { type: String  },//头像url
        gender: { type: String  },//用户的性别，值为1时是男性，值为2时是女性，值为0时是未知
        city: { type: String  },//城市
        province: { type: String  },//省
        country: { type: String  },//国家
        language: { type: String  },//用户的语言，简体中文为zh_CN
        online: { type: Boolean  },//是否在线
        third: { type: Boolean ,default:false },//第三方
        registertime:{type:String},//注册时间
        items:{type:JSON}, //道具
        character:{type:JSON}

    });

    return mongoose.model('User', UserSchema);
};





/*
@map(18, integer_t, integer_t, [output], "拥有得道具数据，Item表里获得得都在这里面")
@colmap(integer_t, integer_t)
items = new Map<number, number>();
// 获得道具
item(id: number, ava: boolean = true): Item {
    if (this.items.has(id))
        return Item.FromIndex(id, this.items.get(id));
    return !ava ? null : Item.FromIndex(id);
}

itemCount(id: number, def: number = 0): number {
    let fnd = this.item(id, false);
    return fnd ? fnd.count : def;
}*/
