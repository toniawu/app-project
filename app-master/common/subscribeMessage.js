//封装方法
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
// 发送订阅消息模板 - 交易
exports.deal = async (event, context) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = event.data || {}
      await cloud.openapi.subscribeMessage.send({
        touser: event._openid, //用户的_openid
        templateId: 'zak3TIfuFoj--GetvpFyQoAG7fTXANFqHmqAA8gydcc',
        page: 'pages/home/home', //pages/my/pages/deal/deal
        data: {
          thing19: { value: data.thing19 }, //店铺名称
          thing14: { value: data.thing14 }, //操作人
          amount27: { value: data.amount27 }, //交易金额
          amount11: { value: data.amount11 }, //结余金额
          time20: { value: data.time20 } //生成时间
        },
        miniprogramState: 'developer' //跳转小程序类型：developer 为开发版；trial为体验版；formal为正式版；默认为正式版
      })
      resolve(true)
    } catch (error) {
      resolve(error)
    }
  })
};