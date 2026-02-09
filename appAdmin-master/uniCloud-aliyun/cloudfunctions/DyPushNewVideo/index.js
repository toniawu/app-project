'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	//获取所有的推送视频
	const videolist = await db.collection('Push_records').get();
	for (const video of videolist.data) {
		//查询user 
		const userData = await db.collection('uni-id-users').where({_id:video.user_id}).get();
		 
		if(userData.data.length == 0){
			continue;
		}
		const users = userData.data[0];
		if(users){
			 
			//查询用户是否观看过 如果没看过 则推送 看过则不推
			const count = await db.collection('Videos_record').where({
				user_id:users._id,
				videos_id:video.video_id
				}).count();
			var rcount = count.total
			//三个月后的时间戳
			if(!rcount){
				//开始推送 
				if(users.wx_openid){
					var openid = users.wx_openid.mp;
					var template_id = 'M5t4KOuKxEh_w8bkDY40MrEc2LZKNLC5md4U_wCmRRg'
					// 引入uni-subscribemsg公共模块
					const UniSubscribemsg = require('uni-subscribemsg');
					// 初始化实例
					let uniSubscribemsg = new UniSubscribemsg({
						dcloudAppid: "__UNI__B5E0435",
						provider: "weixin-mp",
					});
					let result = await uniSubscribemsg.sendSubscribeMessage({
						touser: openid,
						template_id:template_id,
						page: "pages/home/home", // 小程序页面	地址
						miniprogram_state: "formal", // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
						lang: "zh_CN",
						data: {
							thing2: {
								value:  '尽快完成新视频观看'
							},
							thing4: {
								value:  '请于一周内完成视频观看'
							}
						}
					});
				}
			}
		}
	}
};
