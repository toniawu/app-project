'use strict';
const db = uniCloud.database();
const dbc = db.command
const $ = dbc.aggregate
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
	let condition = true;
	const pageSize = 100;
	let pageNum = 0;
	do {
		//获取100个用户
		const userRes = await db.collection('uni-id-users').field({"_id":true,"wx_openid":true})
		.orderBy("_id", "asc")
		.skip(pageNum*pageSize)
		.limit(pageSize).get();
		let userData = userRes.data
		if(userRes.affectedDocs==0){
			condition = false;
			return
		}
		if(userRes.affectedDocs<pageSize){
			condition = false;
		}
		pageNum = pageNum+1;
		let userIds = []
		userData.forEach((x)=>{
			userIds.push(x._id)
		})
		//获取观看进度小于85的用户
		const userGroup = await db.collection('Videos_record').aggregate()
				.match({
					percentage1 : dbc.lt(85),
					user_id:dbc.in(userIds)
					})
					.group({
						_id:{
							user_id:'$user_id',
						},
						count: $.sum(1)
					}).project({
						user_id: 1,
						count: 1
					  })
					  .end()
		if(userGroup.data.length>0){
			const promiseArray = []
			for (const userGroupData of userGroup.data) {
				let userId = userGroupData._id.user_id
				let users = null;
				userData.forEach((x)=>{
					if(x._id == userId ){
						users = x;
					}
				})
				//找到用户
				if(users){
					//有openid 开始推送
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
						let result = uniSubscribemsg.sendSubscribeMessage({
							touser: openid,
							template_id:template_id,
							page: "pages/home/home", // 小程序页面	地址
							miniprogram_state: "formal", // 跳转小程序类型：developer为开发版；trial为体验版；formal为正式版；默认为正式版
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
						promiseArray.push(result)
					}
				}
			}
			if(promiseArray.length>0){
				console.log("一批推送开始");
				let allRet = await Promise.allSettled(promiseArray)
				console.log("一批推送结束",allRet);
			}
		}
		
	} while (condition);
	
	
	
	  
};
