const e_0 = require('../../../../../uni-im-msg-reader/uniCloud/cloudfunctions/common/uni-im-ext-msg-reader');
const e_1 = require('../../../../../wechat-push-notify/uniCloud/cloudfunctions/common/wechat-msg-notify');
module.exports = {
"msg-type-register": [e_0.onMsgTypeRegister],
"push-msg-notify":[e_1.pushWxMsgNotify]
}
