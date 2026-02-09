
const createConfig = require('uni-config-center')
const uniIm = createConfig({ // 获取配置实例
	    pluginId: 'uni-im' // common/uni-config-center下的插件配置目录名
	})
const uniImConf = uniIm.config() 
//获取配置的客服id
const ids = uniImConf.customer_service_uids
const openids = uniImConf.customer_open_id
const db = uniCloud.database();
const db_push_log = "conversation_push_log"
async function pushWxMsgNotify(msgData) {
		// {"to_uids":["676d1d69e0ec1956a9cdc3a3"],
		// "msg":{"type":"incr-conversation",
		// "conversation_id":"single_fea5ba9d900f683a17b6670e3cc14c79"}}
		//查询会话id 近5分钟是否推送过 如果有那么就不推送 如果没有 就推送
		//推送完了 保存推送记录
		let isPush = false;
		let op = 0;//1: "新增", 2 更新
		let openId = ''
		const now = new Date().getTime()/1000; 
	  if(msgData.to_uids&&msgData.to_uids.length>0
	  &&msgData.msg
	  &&msgData.msg.conversation_id){
		 let to_uid = msgData.to_uids[0]
		 if(ids.includes(to_uid)){
			 let idx = ids.indexOf(to_uid)
			 //查询推送记录
			 openId = openids[idx]
			let pushLog =  await db.collection(db_push_log)
			 .where({conversation_id:msgData.msg.conversation_id})
			 .orderBy("pushTime", "desc")
			 .limit(1)
			 .get()
			
			if (pushLog.data&&pushLog.data.length > 0) {
			 	let log = pushLog.data[0]
				//如果近5分钟内推送过 就不推了
				if(log.pushTime<(now-300)){
					isPush = true
				}
				//更新日志
				op = 2
				
			 }else{
				 isPush = true
				 op = 1
			 }
		 }
	  }
      //开始推送
      if(isPush&&openId){
      	var template_id = 'M5t4KOuKxEh_w8bkDY40MrEc2LZKNLC5md4U_wCmRRg'
      	// 引入uni-subscribemsg公共模块 
		const UniSubscribemsg = require('uni-subscribemsg');
      	// 初始化实例
      	let uniSubscribemsg = new UniSubscribemsg({
      		dcloudAppid: "__UNI__B5E0435",
      		provider: "weixin-mp",
      	});
      	let result = await uniSubscribemsg.sendSubscribeMessage({
      		touser: openId,
      		template_id:template_id,
      		page: "pages/chat_message/chat_message", // 小程序页面	地址
      		miniprogram_state: "formal", // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
      		lang: "zh_CN",
      		data: {
      			thing2: {
      				value:  '有新消息'
      			},
      			thing4: {
      				value:  '请及时查看'
      			}
      		}
      	});
		try {
			if(op==1){
					//增加日志
					let addLog = {
						 conversation_id:msgData.msg.conversation_id,
						 pushTime:now
					}
					await db.collection(db_push_log).add(addLog)
				}else if(op==2){
					await db.collection(db_push_log).doc(log._id)
					.update({
					  pushTime: now
					})
				}
			
			} catch (error) {
				console.log(error);
			}
		
		}
		
    
}

module.exports = {
  pushWxMsgNotify,
}
