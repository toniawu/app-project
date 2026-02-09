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
	async getUserVideoList(userId) {
		console.log(userId);
		// 参数校验，如无参数则不需要
		if (!userId) {
			return {
				errCode: -1,
				errMsg: '用户id为空'
			}
		}
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
		
		// 根据用户id查询答卷表
		const res = await db.collection(db_qa).where({user_id: userId}).get();	
		//用户的答卷
		const allQaList = res.data
		if(allQaList.length==0){
			return {
				code: 0,
				msg: "成功",
				data: [],
			}
		}	
		// 看看是不是今天的
		  //获取当前时间
		const nowDt = new Date();
		const nowDate = nowDt.toLocaleDateString()
		
		//查询推送规则
		let allPushRules = await db.collection(db_Push_rules).get()
		let videoRes = await db.collection(db_video).get()
		//推送规则
		allPushRules = allPushRules.data
		//所有视频
		videos = videoRes.data
		//推送列表
		let pushVideoList = []		
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
			
			//取出问卷ID
			const surveyId = allPushRules[i].survey_id
			//根据推送周数和推送日期进行计算日期
			let date = new Date(pushDate);  
		 
			// 一周有7天，所以增加的天数是周数乘以7  
			let additionalDays = pushWeek * 7;  
			 
			// 设置新的日期  
			date.setDate(date.getDate() + additionalDays);
			//将日期进行格式化 yyyy-mm-dd
			date = date.toLocaleDateString()
			 
			const pushTimestamp = Math.floor(new Date(date).getTime() / 1000);  
			const nowTimestamp = Math.floor(new Date(nowDate).getTime() / 1000);  
			 
			//如果当前时间大于等于推送时间相等，则推送,否则返回空结果
			if(pushTimestamp <= nowTimestamp){
				//判断是否有分数范围限制
				if (allPushRules[i].min_score || allPushRules[i].max_score ) {
					//如果有分数范围限制，则根据分数范围进行计算分数
					let groupScore = 0
					if(allQaList.length>0){
						allQaList.questions.forEach((item,index) => {
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
									pushVideoList.push(x)
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
								pushVideoList.push(x)
							}
						}
					})
				}
			} 
		}
		//到此为止 获取到了 所有的推送的视频
		/*看看历史推送的视频记录里，视频id有没有。
			 如果有.看看是不是今天的。
				如果是，忽略
				如果不是，更新推送次数
			 如果没有，新增推送记录
		*/	   
	   let updatePushV = []//这里面存的是推送记录
	   let addPushV = []//这里面存的是视频对象
	   //所有的推送记录
	   let allPushVedioRecord = []
	   allPushVedioRecord.push(...pushData)
	   pushVideoList.forEach((a)=>{		  
		   let exists = false;
		   pushData.forEach((x)=>{
					// 如果有
		   		  if(a._id == x.video_id){
					  exists = true;					 
					//获取推送记录的时间
					const pushTime = new Date(x.push_time).toLocaleDateString()					
					//如果推送记录的时间和当前时间相等，则不再推送
					if (nowDate != pushTime) {
						updatePushV.push(x);
					}
				  }
		   })
		   // 如果没有，新增推送记录
		   if(!exists){
			   //将推送记录存入数据库
			   addPushV.push(a)
		   }
	   })
	   if(updatePushV.length>0){
		   let pushRecordIds = []
		   updatePushV.forEach((x)=>{
			   pushRecordIds.push(x._id)
		   })
		   //更新用户表内的推送次数 和 时间
		   console.log('更新用户表内的推送次数 和 时间',updatePushV);
		   await db.collection(db_pr).where({_id:dbCmd.in(pushRecordIds)}).update(
							{
								num: db.command.inc(1),
								push_time: nowDt
							})
	   }
	   if(addPushV.length>0){		   
		 let insertPushRecords = []
		   addPushV.forEach((x)=>{
			   insertPushRecords.push({
				   video_id: x._id,
				   // users: nickname,//暂时不存了
				   user_id:userId,
				   push_time: nowDt,
				   num:1
			   })
		   })
		   console.log('将推送记录存入数据库',insertPushRecords);
		   //将推送记录存入数据库,记录推送的视频id，用户id，推送时间
		   await db.collection(db_pr).add(insertPushRecords)
		   allPushVedioRecord.push(...insertPushRecords)
	   }
	   //到此为止 把所有视频都添加到 push_record里面了。
	   /*构造视频列表返回
		1、找到所有要推送的视频
		2、找到已经观看过得视频
	   */
	  let resultList = []
	  for (var i = 0; i < allPushVedioRecord.length; i++) {
	  	var apvr = allPushVedioRecord[i]
		//设置视频对象
		for (var j = 0; j < videos.length; j++) {
			var vv = videos[j]
			if(apvr.video_id == vv._id){
				apvr.video = vv
			}
		}
		if(apvr.video){
			//查找观看时长
			var watch = false //默认没看过
			for (var k = 0; k < videoRecordData.length; k++) {
				var element = videoRecordData[k];
				if(element.videos_id==apvr.video_id){
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
	  return result = {
				code: 0,
				msg: "成功",
				data: resultList
			}
	}
		
}
