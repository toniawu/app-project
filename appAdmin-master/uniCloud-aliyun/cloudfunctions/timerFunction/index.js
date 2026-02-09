'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	// const time = new Date();
	// console.log(`定时任务执行时间: ${time.toISOString()}`);
	  // 这里可以添加你的业务逻辑代码
	const now = new Date();
	const year = now.getFullYear();
	const month = now.getMonth() + 1; // 月份是从0开始的
	const day = now.getDate();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds();
	
	// 格式化月份和日期，保持两位数
	const formattedMonth = month < 10 ? '0' + month : month;
	const formattedDay = day < 10 ? '0' + day : day;
	const formattedHours = hours < 10 ? '0' + hours : hours;
	const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
	const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
	
	
	var time =  year+'年'+formattedMonth+'月'+formattedDay+'日';
	// //推送未答题的问卷
	const list = await db.collection('uni-id-users').get();
	const timestamp = new Date().getTime();
	
	for (const users of list.data) {
		//三个月后的时间戳
		 
		if(users.wen_id){
			if(!users.wen_date){
				var wendata = 0 
			}else{
				var wendata = users.wen_date
			}
			var three  = wendata+7776000;
			if(three < timestamp){ 
				//则过期  更新试卷为空
				await db.collection('uni-id-users').where({'_id':users._id}).update({'wen_id':'',wen_date:''});
			}	
		}
		
		if(users.wx_openid){
		 
			  const min = 1000;
			  const max = 9999;
			  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
			//则去推送让去答卷
			var openid = users.wx_openid.mp;
			 
			var template_id = '7_tDJv2IAYHG3xE-qp54HqZDPQMvjMDMGTBYesSbqrI'
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
					thing7: {
						value:  '已完成视频观看任务，请尽快完成问卷'
					},
					date5: {
						value:  time
					}
				}
			});
		}
	}
	
	  
	  
};
