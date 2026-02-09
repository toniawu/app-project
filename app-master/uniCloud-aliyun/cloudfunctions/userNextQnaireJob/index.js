'use strict';
const db = uniCloud.database();
const dbc = db.command
const db_user_questionnaire = "user_questionnaire"
const db_questionnaire = "questionnaire"
exports.main = async (event, context) => {
	const createTime = new Date().getTime();
	const now = Number.parseInt( createTime/1000);
	//先查询所有的问卷
	const res_questionnaire = await db.collection(db_questionnaire).get()
	const allQa = res_questionnaire.data
	let condition = true;
	const pageSize = 100;
	let pageNum = 0;
	do {
		//获取100个需要生成下一个问卷的数据
		
		const res = await db.collection(db_user_questionnaire)
		.where({
			"status":1,
			"next_id":dbc.gt(0),
			"next_time":dbc.lt(now)
		})
		.orderBy("_id", "asc")
		.skip(pageNum*pageSize)
		.limit(pageSize).get();
		
		let user_qa = res.data
		if(user_qa.length==0){
			condition = false;
			return
		}
		console.log(res);
		pageNum = pageNum+1;
		
		
		
		//获取用户id
		//获取数据id
		let dataIds = []
		let userIds = []
		user_qa.forEach((x)=>{
			userIds.push(x.user_id)
			dataIds.push(x._id)
		})
		//更新数据status = 0 ，新增一条数据
		await db.collection(db_user_questionnaire).where({"_id":dbc.in(dataIds)}).update({"status":0})
		
		
		//看看下一个问卷是否还有下一个问卷
		let inserts = []
		user_qa.forEach((x)=>{
			var add = {
				user_id:x.user_id,
				wen_id:x.next_id+"",
				status:0,
				next_id:"",
				next_time:"",
				create_date:createTime
			}
			var num = x.next_id
			var hasNext = false;
			var next = null
			allQa.forEach((y)=>{
				if(y.num==num&&y.next_num&&y.next_interval_day){
					hasNext = true
					next = y
				}
			})
			if(hasNext){
				add.status = 1
				add.next_id=Number.parseInt(next.next_num)
				add.next_time = now+Number.parseInt(next.next_interval_day)*24*3600
			}
			inserts.push(add)
		})
		await db.collection(db_user_questionnaire).add(inserts)
		
		
		//获取用户的openid 
		const userRes = await db.collection('uni-id-users').field({"_id":true,"wx_openid":true})
		.where({"_id":dbc.in(userIds)}).get();
	
		if(userRes.data.length>0){
			const promiseArray = []
			for (var user of userRes.data) {
				//找到用户
				if(user){
					//有openid 开始推送
					if(user.wx_openid){
						var openid = user.wx_openid.mp;
						var template_id = 'M5t4KOuKxEh_w8bkDY40MrEc2LZKNLC5md4U_wCmRRg'
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
								thing2: {
									value:  '您有新的问卷'
								},
								thing4: {
									value:  '请尽快完成答卷'
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
