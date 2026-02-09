'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	 
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1; // 月份是从0开始的
	const day = now.getDate();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();
	const formattedMonth = month < 10 ? '0' + month : month;
	const formattedDay = day < 10 ? '0' + day : day;
	const formattedHours = hours < 10 ? '0' + hours : hours;
	const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
	const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
	var time =  year+'年'+formattedMonth+'月'+formattedDay+'日';
	
	//获取所有视频
	const videolist = await db.collection('Videos_record').where({_id:'669a3056816a3ff91049872a'}).get();
	for (const video of videolist.data) {
		//三个月后的时间戳
		var sc = Math.round(video.number/video.count*100)
		if(sc < 85){
			//开始推送 
			const userData = await db.collection('uni-id-users').where({_id:video.user_id}).get();
			const users = userData.data[0];
			if(users.wx_openid){
				var openid = users.wx_openid.mp;
				var template_id = 'ejc2fjY4BZ7JqDuYV4rW4x2byGybZhCw009N4d7AhW4'
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
					miniprogram_state: "developer", // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
					lang: "zh_CN",
					data: {
						thing5: {
							value:  '视频观看内容仍未完成'
						},
						date3: {
							value:  time
						}
					}
				});
			}
		}
	}
	  
};
