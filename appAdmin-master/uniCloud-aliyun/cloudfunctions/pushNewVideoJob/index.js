'use strict';
const db = uniCloud.database();
const dbc = db.command
const $ = dbc.aggregate
/**
 * 定时推送新的视频。如果用户有未看过的视频。推送提醒
 */
exports.main = async (event, context) => {
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
		//获取未观看的推送记录
		const userGroup = await db.collection('Push_records').aggregate()
				.match({
					watch_state : 0,
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
		console.log(userGroup);
		if(userGroup.data.length>0){
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
					console.log('开始推送',users);
					//有openid 开始推送
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
		
	} while (condition);
};
