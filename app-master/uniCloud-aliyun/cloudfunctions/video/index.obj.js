// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
// 视频模块
const db = uniCloud.database()
const db_vr =  'Videos_record'//视频观看记录
const db_pr =  'Push_records' //推送记录
const db_user =  'uni-id-users' //用户
const db_qa =  'question_answer' //用户答卷
const db_video =  'Videos' //视频
const db_Push_rules =  'Push_rules' //推送规则
const dbCmd = db.command
module.exports = {
	_before: function () { // 通用预处理器

	},
	/**
	 * 获取用户的视频列表
	 * @param {string} userId 用户id
	 * @returns {object} 返回值描述
	 */	
	async getUserVideoList(params) {
		console.log(params);
		// 参数校验，如无参数则不需要
		if (!params.userId) {
			return {
				errCode: -1,
				errMsg: '用户id为空'
			}
		}
		let userId = params.userId
		const user = await db.collection(db_user).where({_id:userId}).get();
		if(!user.data){
			return {
				errCode: -1,
				errMsg: '用户不存在'
			}
		}
		// 业务逻辑
		//视频观看记录
		const vr = await db.collection(db_vr).where({user_id:userId}).get();
		//推送记录
		const pr = await db.collection(db_pr).where({user_id:userId}).get();
		let pushData = pr.data
		/**
		 * 如果推送记录是空的，那么就生成推送记录
		 */
		let videoRecordData = vr.data
		//待删除的观看记录
		let delVrs = []
		for (let v of videoRecordData) {
			let exists = false;
			for (let p of pushData) {
				if(v.videos_id==p.video_id){
					exists = true;
				}
			}
			//如果不存在 添加到删除里面
			if(!exists){
				delVrs.push(v._id)
			}
		}
		
		//将删除的 过滤掉
		let vrd = []
		videoRecordData.forEach((x)=>{
			if(!delVrs.includes(x._id)){
				vrd.push(x)
			}			
		})
		videoRecordData = vrd;
		
		if(delVrs.length>0){
			console.log('删除数据',delVrs);
			//删除数据
			await db.collection(db_vr).where({_id : dbCmd.in(delVrs)}).remove();
		}
		
		// 根据用户id查询最新的答卷表
		const res = await db.collection(db_qa).where({user_id: userId})
		.orderBy("_creatTime","desc")
		.get();	
		//用户的答卷
		const allQaList = res.data
		if(allQaList.length==0){
			return {
				code: 0,
				msg: "成功",
				data: [],
			}
		}	
		//问卷id
		let wenId = allQaList[0].questionnaire_id
		//答卷时间
		let wenDate = allQaList[0]._creatTime
		
		let pushVideoList = []		
		let videoRes = await db.collection(db_video).get()
		//所有视频
		videos = videoRes.data
		//如果没有过推送记录，说明是第一次答问卷。需要创建推送记录
		if(pushData.length==0){
			//根据问卷id 查询推送规则
			let allPushRules = await db.collection(db_Push_rules).where({survey_id:wenId}).get()
			
			//推送规则
			allPushRules = allPushRules.data
			
			//推送视频数组 json对象 格式 {videoid:0,pushDate:''} 存储视频id 和 推送的日期
			
			//要推送的视频id 用来去重使用
			let pushVideoIds = []		
			//根据每个推送规则进行数据处理
			for (let i = 0; i < allPushRules.length; i++) {
				//将每个推送规则的pushDate取出来  推送时间
				const pushDate = allPushRules[i].pushDate
				//将每个推送规则的pushWeek取出来  推送周数
				const pushWeek = allPushRules[i].pushWeek
				//取出所有视频ID    推送视频
				const videoId = allPushRules[i].video_id
				//将该规则内的问题ID取出来  
				const questionsList = allPushRules[i].questions
			
				//利用答卷时间，根据推送周数进行计算日期
				let date = new Date(wenDate);  
			 
				// 一周有7天，所以增加的天数是周数乘以7  
				let additionalDays = pushWeek * 7;  
				 
				// 设置新的日期  
				date.setDate(date.getDate() + additionalDays);
				date.setHours(0)
				date.setMinutes(0)
				date.setSeconds(0)
				date = date.getTime()
				//根据推送规则 生成推送记录
				//判断是否有分数范围限制
				if (allPushRules[i].min_score || allPushRules[i].max_score ) {
					//如果有分数范围限制，则根据分数范围进行计算分数
					let groupScore = 0
					if(allQaList.length>0){
						allQaList[0].questions.forEach((item,index) => {
							//判断问题的id是否在questionsList数组中						 
							if (questionsList.includes(item.question_id)) {
								//如果在，则将该问题的分数取出来
								groupScore += item.score
							}
						})
					}
					//判断分数是否在范围内
					if (groupScore >= allPushRules[i].min_score && groupScore <= allPushRules[i].max_score) {	
						//根据视频ID查询视频信息
						videos.forEach((x)=>{
							if(x._id == videoId){
								//将视频信息加入到推送列表
								if(!pushVideoIds.includes(x._id)){
									pushVideoIds.push(x._id)
									pushVideoList.push({
										videoId:x._id,
										pushDate:date
									})
								}
							}
						})
					} 
				}else {
					//如果没有分数范围限制，则直接推送
					//根据视频ID查询视频信息
					videos.forEach((x)=>{
						if(x._id == videoId){
							//将视频信息加入到推送列表
							if(!pushVideoIds.includes(x._id)){
								pushVideoIds.push(x._id)
								pushVideoList.push({
										videoId:x._id,
										pushDate:date
									})
							}
						}
					})
				}
				
			}
			//到此为止 获取到了 所有的推送的视频 包含将来的要推送的视频
			//保存到表里Push_records
			if(pushVideoList.length>0){		   
					 let insertPushRecords = []
					   pushVideoList.forEach((x)=>{
						   insertPushRecords.push({
							   video_id: x.videoId,
							   user_id:userId,
							   push_time: x.pushDate,
							   watch_state : 0,
							   num:1
						   })
					   })
					   console.log('将推送记录存入数据库',insertPushRecords);
					   //将推送记录存入数据库,记录推送的视频id，用户id，推送时间
					   await db.collection(db_pr).add(insertPushRecords)
			}
		}else{
			pushData.forEach((x)=>{
				pushVideoList.push(
					{
							videoId:x.video_id,
							pushDate:x.push_time
						}
				)
			})
		}
		
	   //到此为止 把所有视频都添加到 push_record里面了。包含将来的要推送的视频
	   /*构造视频列表返回
		1、找到所有要推送的视频 推送日期小于当前日期的
		2、找到已经观看过得视频
	   */
	  //  Create a two  date objects
	  
	  const nowDate = new Date()

	  let resultList = []
	  for (var i = 0; i < pushVideoList.length; i++) {
	  	var apvr = pushVideoList[i]
		//推送日期小于当前日期的
		if(apvr.pushDate<=nowDate){
			//设置视频对象
			for (var j = 0; j < videos.length; j++) {
				var vv = videos[j]
				if(apvr.videoId == vv._id){
					apvr.video = vv
				}
			}
			if(apvr.video){
				//查找观看时长
				var watch = false //默认没看过
				for (var k = 0; k < videoRecordData.length; k++) {
					var element = videoRecordData[k];
					if(element.videos_id==apvr.videoId){
						watch = true
						if(element.number >= element.count ){
							apvr.video.count = element.number
						}else{
							apvr.video.count = element.count
						}
						apvr.video.percentage = element.percentage
						apvr.video.number = element.number
						resultList.push(apvr.video)
					}			
				}
				if(!watch){
					apvr.video.percentage = '0%'
					apvr.video.number = 0
					apvr.video.count = 999999999
					resultList.push(apvr.video)
				}
			}else{
				console.log('视频不存在',apvr)
			}
		}
		
	  }
	  return result = {
				code: 0,
				msg: "成功",
				data: resultList
			}
	}
		
}
