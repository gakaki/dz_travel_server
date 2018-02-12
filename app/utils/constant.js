exports.LoginMethod = {
    PHONE: 0x1, // 手机登陆
    WECHAT_QRCODE: 0x21, // 微信扫码登陆
    WECHAT_PUB: 0x22, // 微信公众号授权登陆
    WECHAT_APP: 0x23, // 微信APP授权登陆
    WECHAT_MINI_APP: 0X24,//微信小程序
    // 判断用掩码，不放客户端
    WECHAT_MASK: 0x20
};
exports.Code = {
    AUTH_FAILED: -99,//授权失败
    LOGIN_FAILED: -100, // 登陆失败
    USER_EXISTS: -101, // 用户已经存在
    LOGIN_EXPIRED: -102, // 登陆过期需要重新登陆
    ANNOYMOUS_DENY: -103, // 匿名无权
    USER_NOT_FOUND: -104, // 没有找到用户
    VERIFY_FAILED: -105, // 验证失败
    ROOMID_FAILED: -106, // 分派房间id失败
    FRIEND_WAIT: -107, // 正在等待好友通过
    REQUIREMENT_FAILED: -108, // 不满足条件
    ROOM_FULLED: -109, // 满员
    ROOM_EXPIRED: -110, // 房间过期
    ROOM_USER_EXISTS: -111, // 用户已经在房间内
    GANG_FULLED: -112, // 宝宝列表已满
    NEED_ITEMS: -113, // 道具不足
    FRIEND_APPLY: -114, // 正在等待自己通过
    FRIEND_DONE: -115, // 已经是好友
    CANNOT_CHANGED: -116, // 性别已经修改过，不能再次修改
    PICKED: -117, // 已经领取
    REQUIRED_LOST: -118, // 条件未满足
    USER_OFFLINE: -119, // 用户不在线
    USER_INTEAM: -120, // 用户已经组队
    ANSWER_WRONG: -121, // 回答错误
    CANNOT_BE_SELF: -122, // 是自己
    GANG_ALREADY_RECOMMAND: -123, // 已经自荐过了
    NO_USING_PET: -124, // 没有佩戴中的宠物
    ROOM_JOINING: -125, // 用户正在参与一个房间的活动
    PHONE_BINDED: -126, // 手机已经绑定过其他账号
    MUST_FRIEND: -127, // 必须是好友
    PACKID_MQ_CREATE_FAILED: -128, // 红包消息通道失败
    COUNT_OVER: -129, //竞猜次数用尽
    PACK_EMPTY: -130, //红包不存在
    PACK_EXPIRED: -131, //红包已过期
    PACK_FINSH: -132, //红包竞猜结束
    PACK_ISCD: -133, //红包竞猜CD中
    PACK_ISSHARED: -134,//不是首次分享
    NO_MONEY: -136,//企业没钱
    EXCEED_COUNT: -137,//超过提现次数
    LESS_MONEY: -138,//低于最低限额
    PACK_Fighing: 168, //红包可竞猜
    NEED_COUPON: 170, //代金券不足
    NEED_MONEY: 171, //金额不足
    UNKNOWN: -1000,
    EXCEPTION: -999, // 遇到了未处理的异常
    ROUTER_NOT_FOUND: -998, // 没有找到路由
    CONTEXT_LOST: -997, // 上下文丢失
    MODEL_ERROR: -996, // 恢复模型失败
    PARAMETER_NOT_MATCH: -995, // 参数不符合要求
    NEED_AUTH: -994, // 需要登陆
    TYPE_MISMATCH: -993, // 参数类型错误
    FILESYSTEM_FAILED: -992, // 文件系统失败
    FILE_NOT_FOUND: -991, // 文件不存在
    ARCHITECT_DISMATCH: -990, // 代码不符合标准架构
    SERVER_NOT_FOUND: -989, // 没有找到服务器
    LENGTH_OVERFLOW: -988, // 长度超过限制
    TARGET_NOT_FOUND: -987, // 目标对象没有找到
    PERMISSIO_FAILED: -986, // 没有权限
    WAIT_IMPLEMENTION: -985, // 等待实现
    ACTION_NOT_FOUND: -984, // 没有找到动作
    TARGET_EXISTS: -983, // 已经存在
    STATE_FAILED: -982, // 状态错误
    UPLOAD_FAILED: -981, // 上传失败
    MASK_WORD: -980, // 有敏感词
    SELF_ACTION: -979, // 针对自己进行操作
    PASS_FAILED: -978, // 验证码匹配失败
    OVERFLOW: -977, // 数据溢出
    AUTH_EXPIRED: -976, // 授权过期
    SIGNATURE_ERROR: -975, // 签名错误

    IM_CHECK_FAILED: -899, // IM检查输入的参数失败
    IM_NO_RELEATION: -898, // IM检查双方不存在关系

    THIRD_FAILED: -5, // 第三方出错
    MULTIDEVICE: -4, // 多端登陆
    HFDENY: -3, // 高频调用被拒绝（之前的访问还没有结束) high frequency deny
    TIMEOUT: -2, // 超时
    FAILED: -1, // 一般失败
    OK: 0, // 成功
    DELAY_RESPOND: 10000, // 延迟响应
    REST_NEED_RELISTEN: 10001 // rest访问需要重新启动监听
};

exports.UserActionRecordType = {
    "REGISTER": 0,
    "LOGIN": 1,
    "LOGOUT": 2,
    "MODIFY": 3,
    "BINDPHONE": 4,
    "CHGPASSWD": 5
};

exports.Format={
    BASE64:0,
    HEX:1
};