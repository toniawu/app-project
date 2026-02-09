// 消息推送模块
const db = uniCloud.database()
// 引入 uniCloud SDK（具体引入方式可能因平台版本而异）  
// const uniCloud = require('@dcloudio/uni-cloud-common');


async function getVideoId() {
	const collection = db.collection('Videos')
	const res = await collection.get()
	return res.data
}

//没分数限制推送列表
async function getPushList(videoId) {
	const collection = db.collection('Videos')
	const res = await collection.where({_id:videoId}).get()
	return res.data
	
}




module.exports = {
	_before: function () { // 通用预处理器
		this.params = this.getParams() // 获取请求参数

	},
	/**
	 * 获取精选视频
	 */
	async getSelectedVideos(){
		const collection = db.collection('Videos')
		const res = await collection.where({'selected':1}).get();
		return res.data
	},
	async getSurveysId(){
 
		this.params = JSON.parse(this.getHttpInfo().body)
		const collection = db.collection('question_answer')
		const ScoreList = await collection.where({user_id:this.params.uid}).orderBy('_createTime','desc').get();
		if(ScoreList.data != ''){
			//获取试卷编号 通过试卷编号查询分类编号
			let surveysId =  ScoreList.data[0].category_id
			const collection1 = db.collection('Surveys')
			const category = await collection1.where({_id:surveysId}).get();
			return category.data[0].category_id
		}
		return 0;
	},
	//获取所有视频列表
	async getAllVideoList() {
		const collection = db.collection('Videos')
		let data =  this.getHttpInfo().queryStringParameters
		const res = await collection.where({'category_id':data.category_id}).get();
		  
		//增加百分比 和 观看到记录秒数返回
		for(let i=0;i<res.data.length;i++){
			if(data.uid){
				const videoRecordCollection = db.collection('Videos_record');
				const querySnapshot = await  videoRecordCollection.where({'user_id':data.uid,'videos_id':res.data[i]._id}).get(); 
				if(querySnapshot.data != ''){
					res.data[i].percentage = querySnapshot.data[0]['percentage']
					res.data[i].number = querySnapshot.data[0]['number']
					res.data[i].count = querySnapshot.data[0]['count']
				}else{
					res.data[i].percentage = '0%'
					res.data[i].number = 0
					res.data[i].count = 999999999
				}
				 
			} 
			 
		}
		return result = {
			code: 200,
			msg: "获取视频列表成功",
			data: res.data
		}
		
	},
	
	//获取所有用户分数表
	async getAllUserScore() {
		const collection = db.collection('Score')
		const res = await collection.get()
		
		return result = {
			code: 200,
			msg: "获取用户分数表成功",
			data: res.data,
		}
	},
	async getNewVideoById(id) {
		
		const collection = db.collection('Videos')
		const res = await collection
		.where({
			_id: id,
		})
		.get()
		return result = {
			code: 200,
			msg: "获取视频信息成功",
			data: res.data,
		}
	},
	//根据视频ID获取视频信息
	async getVideoById() {
		this.params = JSON.parse(this.getHttpInfo().body)
		
		const collection = db.collection('Videos')
		const res = await collection
		.where({
			_id: this.params.id,
		})
		.get()
		//查询是否已经播放过，如果播放过 获取当前用户观看时间
		
		return result = {
			code: 200,
			msg: "获取视频信息成功",
			data: res.data,
		}
	},
	//获取分数表数据
	async getScore() {
		const collection = db.collection('Score')
		const res = await collection.get()
		
		return result = {
			code: 200,
			msg: "获取分数表成功",
			data: res.data,
		}
	},
	
	
	
	//最新推送规则
	async processPush() {
		
		let pushLists1 = await db.collection('Videos').get()
		
		pushLists1 = pushLists1.data
		pushLists1.forEach((x)=>{
			x.percentage = '0%'
			x.number = 0
			x.count = 999999999
		})
		if(pushLists1){
			return result = {
				code: 200,
				msg: "成功233",
				data: pushLists1
			}
		}
		return
		
		
		
		
		// // return this.params[0].id
		// const user_id = this.params[0].id
		
		// const list = await db.collection('uni-id-users').where({_id:user_id}).get();
		// for (const users of list.data) {
		// 	const vr = await db.collection('Videos_record').where({user_id:users._id}).get();
		// 	const pr = await db.collection('Push_records').where({user_id:users._id}).get();
		// 	const vs = [];
		// 	for (const v of vr.data) {
		// 		vs.push(v.videos_id)
		// 	}
		// 	const ps = [];
		// 	for (const p of pr.data) {
		// 		ps.push(p.video_id)
		// 	}
		// 	for(var i = 0;i < vs.length;i++){
		// 		let exists = ps.includes(vs[i]);
		// 		//把没有推送记录的 观看记录删除
		// 		if(!exists){
		// 			await db.collection('Videos_record').where({videos_id:vs[i],user_id:users._id}).remove();
		// 		}
		// 	}
		// }
		// // this.params = JSON.parse(this.getHttpInfo().body)
		// // 根据用户id查询分数表
		// const collection = db.collection('Score')
		// const res = await collection
		// .where({
		// 	uid: this.params[0].id,
		// })
		// .orderBy('_id','desc')
		// .get()
		 
		// //将所有该用户的数据存入
		// const allScoreList = res.data
		// // return allScoreList
		// //取出用户昵称 这里有问题，如果没有答过题 会报错
		// const nickname = allScoreList[0].nickname
		// // return nickname
		
		// //取出所有的问卷ID
		// const surveysIdList = []
		// for (let i = 0; i < 1; i++) {
		// 	//如果结果是undefined，则跳过
		// 	if (allScoreList[i].surveysId == undefined) {
		// 		continue
		// 	}
		// 	surveysIdList.push(allScoreList[i].surveysId)
		// }
		// //获取用户的答题问卷
		// // return surveysIdList
		// //取出所有问题的分数scoreList
		// const scoreList = []
		// for (let i = 0; i < 1; i++) {
		// 	//如果结果是undefined，则跳过
		// 	if (allScoreList[i].score == undefined) {
		// 		continue
		// 	}
		// 	scoreList.push(allScoreList[i].scoreList)
		// }
		// // 用户答题问卷的所有问题
		// // return scoreList
		
		// //6661caa8ce5ec96267761e1c
		// //根据问卷ID查询推送规则   //查询该问卷的所有推送信息
		// let allPushRules = await db.collection('Push_rules').where({
		// 	survey_id: db.command.in(surveysIdList),
			 
		// }).get()
		
		// allPushRules = allPushRules.data
		 
		
		// //获取该用户答题问卷的所有推送
		// // return allPushRules.data
		 
		// //无限制推送列表
		// const noLimitPushList = []
		// //有限制推送列表
		// let limitPushList = []
		// //推送列表
		// let pushList = []
		
		// //根据每个推送规则进行数据处理
		// for (let i = 0; i < allPushRules.length; i++) {
		// 	//将每个推送规则的pushDate取出来  推送时间
		// 	const pushDate = allPushRules[i].pushDate
		// 	//将每个推送规则的pushWeek取出来  推送周数
		// 	const pushWeek = allPushRules[i].pushWeek
		// 	console.log(pushWeek,pushDate)
		// 	//取出所有视频ID    推送视频
		// 	const videoId = allPushRules[i].video_id
		// 	//将该规则内的问题ID取出来   推送问卷
		// 	const questionsList = allPushRules[i].questions
		// 	console.log('规则内的问题是',questionsList)
		// 	//推送关联问题
		// 	// return questionsList
		// 	//取出问卷ID
		// 	const surveyId = allPushRules[i].survey_id
		// 	//根据推送周数和推送日期进行计算日期
		// 	let date = new Date(pushDate);  
		 
		// 	// 一周有7天，所以增加的天数是周数乘以7  
		// 	let additionalDays = pushWeek * 7;  
			 
		// 	// 设置新的日期  
		// 	date.setDate(date.getDate() + additionalDays);
		// 	//将日期进行格式化 yyyy-mm-dd
		// 	date = date.toLocaleDateString()
		 
			
		// 	//获取当前时间
		// 	const nowDate = new Date().toLocaleDateString()
		// 	console.log('d',nowDate)
			
			
			
			 
		// 	const timestamp = Math.floor(new Date(date).getTime() / 1000);  
		// 	const timestamp1 = Math.floor(new Date(nowDate).getTime() / 1000);  
		// 	console.log('时间戳为：'+timestamp)

			 
		// 	//如果当前时间和推送时间相等，则推送,否则返回空结果
		// 	// if (date <= nowDate) {
		// 	if(timestamp <= timestamp1){
	 
				 
				
		// 		console.log('推送')
		// 		//判断是否有分数范围限制
		// 		// if (true) {
		// 		if (allPushRules[i].min_score || allPushRules[i].max_score ) {
		// 			//如果有分数范围限制，则根据分数范围进行计算分数
		// 			console.log('有分数范围限制')
					 
		// 			//根据问卷ID查询分数表
		// 			const collection = db.collection('Score')
		// 			let  scoreList = await collection.where({
		// 				surveysId: surveyId}).get()
		// 			//将问题的id取出来
		// 			scoreList = scoreList.data[0].scoreList
		// 			console.log('分数列表是:',scoreList)
					
		// 			// return questionsList
					 
		// 			let groupScore = 0
		// 			scoreList.forEach((item,index) => {
		// 				console.log('问题列表是',questionsList)
		// 				console.log('得分问题是:',item.questionId)
		// 				//将问题规则列表中的value取出来
		// 				// let valueList = questionsList.map((item) => {
		// 				// 	return item.value
		// 				// })
		// 				// console.log('问题规则列表是',valueList)
		// 				//判断问题的id是否在questionsList数组中
						 
		// 				if (questionsList.includes(item.questionId)) {
		// 					//如果在，则将该问题的分数取出来
		// 					groupScore += item.score1
		// 					return groupScore
		// 				}
						
		// 			})
					
					
					 
					
		// 			// for(var is=0;is<scoreList.length;is++){
		// 			// 	// return scoreList[is]
		// 			// 	for(var ks=0;ks<questionsList.length;ks++){
		// 			// 		// return questionsList[ks] +'=='+ scoreList[is].questionId+'fen'+scoreList[is].score1
							
		// 			// 		if(questionsList[ks] == scoreList[is].questionId){
		// 			// 			groupScore += scoreList[is].score1
		// 			// 		}
		// 			// 	}
		// 			// }
					
		// 			console.log('总分数是',groupScore)
		// 			//判断分数是否在范围内
		// 			if (groupScore >= allPushRules[i].min_score && groupScore <= allPushRules[i].max_score) {
						
		// 				//如果在范围内，则推送
		// 				console.log('分数在范围内,视频id是:',videoId)
		// 				//根据视频ID查询视频信息
		// 				const collection = db.collection('Videos')
		// 				const video = await collection
		// 				.where({_id:videoId})
		// 				.get()
					 
		// 				//将视频信息加入到推送列表
		// 				limitPushList.push(...video.data)
		// 				pushList.push(...video.data)
		// 				console.log(video.data)
						
		// 				//加个判断，如果该用户今天已经推过该视频 可以避免多个规则有同一个视频。导致推送重复
		// 				const pushRecord = await db.collection('Push_records').where({
		// 					user_id:user_id,
		// 					video_id: video.data[0]._id,
		// 					}).get()
		// 				//如果推送记录不为空
		// 				if (pushRecord.data.length > 0 ) {
		// 					console.log('该用户今天已经推送过该视频')
		// 					//获取当前时间
		// 					const nowDate = new Date().toLocaleDateString()
		// 					console.log(nowDate)
		// 					//获取推送记录的时间
		// 					const pushTime = new Date(pushRecord.data[0].push_time).toLocaleDateString()
		// 					console.log(pushTime)
		// 					//如果推送记录的时间和当前时间相等，则不再推送
		// 					if (nowDate == pushTime) {
		// 						console.log('今天已经推送过该视频')
								
		// 					}else{
		// 						//更新用户表内的推送次数 和 时间
		// 						await db.collection('Push_records').where({
		// 							user_id:user_id,
		// 							video_id: video.data[0]._id,
		// 						})
		// 						.update({
		// 							num: db.command.inc(1),
		// 							push_time: new Date()
		// 						})
		// 					}
		// 				}else{
		// 					//将推送记录存入数据库,记录推送的视频id，用户id，推送时间
		// 					await db.collection('Push_records')
		// 					.add({
		// 						video_id: video.data[0]._id,
		// 						users: nickname,
		// 						user_id:user_id,
		// 						push_time: new Date(),
		// 						num:1
		// 					})
		// 				}
		// 			} 
		// 		}else {
					 
					 
		// 			//如果没有分数范围限制，则直接推送
		// 			console.log('没有分数范围限制')
		// 			//根据视频ID查询视频信息
		// 			const collection = db.collection('Videos')
		// 			const video = await collection.where({_id:videoId}).get()
		// 			// for(let i=0;i<video.data.length;i++){
		// 			// 	if(pararmss.id){
		// 			// 		const videoRecordCollection = db.collection('Videos_record');
		// 			// 		const querySnapshot = await  videoRecordCollection.where({'user_id':pararmss.id,'videos_id':video.data[i]._id}).get(); 
		// 			// 		if(querySnapshot.data != ''){
		// 			// 			video.data[i].percentage = querySnapshot.data[0]['percentage']
		// 			// 			video.data[i].number = querySnapshot.data[0]['number']
		// 			// 			video.data[i].count = querySnapshot.data[0]['count']
		// 			// 		}else{
		// 			// 			video.data[i].percentage = '0%'
		// 			// 			video.data[i].number = 0
		// 			// 			video.data[i].count = 999999999
		// 			// 		}
		// 			// 	} 
		// 			// }
					
					
		// 			//将视频信息加入到推送列表
		// 			noLimitPushList.push(...video.data)
		// 			//最新
		// 			pushList.push(...video.data)
		// 			console.log('没分数限制视频是',video.data)
		// 			//加个判断，如果该用户今天已经推过该视频
		// 			const pushRecord = await db.collection('Push_records').where({
		// 				user_id:user_id,
		// 				video_id: video.data[0]._id,
		// 				}).get()
					
		// 			//如果推送记录不为空
		// 			if (pushRecord.data.length > 0 ) {
		// 				console.log('该用户今天已经推送过该视频')
		// 				//获取当前时间
		// 				const nowDate = new Date().toLocaleDateString()
		// 				console.log(nowDate)
		// 				//获取推送记录的时间
		// 				const pushTime = new Date(pushRecord.data[0].push_time).toLocaleDateString()
		// 				console.log(pushTime)
						
		// 				//如果推送记录的时间和当前时间相等，则不再推送
		// 				if (nowDate == pushTime) {
		// 					console.log('今天已经推送过该视频')
		// 				}else{
		// 					//更新用户表内的推送次数 和 时间
		// 					await db.collection('Push_records').where({
		// 						user_id:user_id,
		// 						video_id: video.data[0]._id,
		// 					})
		// 					.update({
		// 						num: db.command.inc(1),
		// 						push_time: new Date()
		// 					})
							
		// 				}
		// 			}else{
		// 				//将推送记录存入数据库,记录推送的视频id，用户id，推送时间
		// 				await db.collection('Push_records')
		// 				.add({
		// 					video_id: video.data[0]._id,
		// 					users: nickname,
		// 					user_id:user_id,
		// 					push_time: new Date(),
		// 					num:1
		// 				})
						 
						
		// 			}
					
					 
		// 		}
		// 	} 
		// }
		// console.log('无分数限制推送列表是',noLimitPushList)
		// console.log('有分数限制推送列表是',limitPushList)
		
		
		// let allVideo = await db.collection('Push_records').where({
		// 	user_id: user_id,
		// }).get()
		// allVideo = allVideo.data
			 
		// const videoIdList = []
		// for (let i = 0; i < allVideo.length; i++) {
		// 	videoIdList.push(allVideo[i].video_id)
		// }
	 
		 
		// //根据问卷ID查询推送规则   //查询该问卷的所有推送信息
		// let pushLists = await db.collection('Videos').where({
		// 	_id: db.command.in(videoIdList),
		// }).get()
		
		// pushLists = pushLists.data
		
		
		
		// // //判断返回值判断返回哪个pushList
		// if (pushLists.length > 0) {
		 
		// 	for(let i=0;i<pushLists.length;i++){
		// 		if(user_id){
		// 			const videoRecordCollection = db.collection('Videos_record');
		// 			const querySnapshot = await  videoRecordCollection.where({
		// 				'user_id':user_id,
		// 				'videos_id':pushLists[i]._id,
		// 				}).get(); 
		// 			if(querySnapshot.data != ''){
		// 				pushLists[i].percentage = querySnapshot.data[0]['percentage']
		// 				pushLists[i].number = querySnapshot.data[0]['number']
		// 				if(querySnapshot.data[0]['number'] >= querySnapshot.data[0]['count'] ){
		// 					pushLists[i].count = querySnapshot.data[0]['number']
		// 				}else{
		// 					pushLists[i].count = querySnapshot.data[0]['count']
		// 				}
						 
		// 			}else{
		// 				pushLists[i].percentage = '0%'
		// 				pushLists[i].number = 0
		// 				pushLists[i].count = 999999999
		// 			}
		// 		} 
		// 	}
			
		// 	return result = {
		// 		code: 200,
		// 		msg: "成功233",
		// 		data: pushLists,
		// 	}
		// }else {
		// 	return result = {
		// 		code: 202,
		// 		msg: "成功",
		// 		data: [],
		// 	}
		// }
		
		
		// if (noLimitPushList.length > 0) {
		// 	return result = {
		// 		code: 200,
		// 		msg: "成功",
		// 		data: noLimitPushList,
		// 	}
		// }else if (limitPushList.length > 0) {
		// 		return result = {
		// 			code: 201,
		// 			msg: "成功",
		// 			data: limitPushList,
		// 		}
		// }else {
		// 		return result = {
		// 			code: 202,
		// 			msg: "成功",
		// 			data: [],
		// 		}
		// }
		
	}
		
		
		
		
	
		
		
	
		
		
		
	
	
	
	
		

	
}
