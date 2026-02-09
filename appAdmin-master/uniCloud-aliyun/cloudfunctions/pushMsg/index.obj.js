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
	
	
	//获取所有视频列表
	async getAllVideoList() {
		const collection = db.collection('Videos')
		const res = await collection.get()
		
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
		return result = {
			code: 200,
			msg: "获取视频信息成功",
			data: res.data,
		}
	},
	//推送视频
	async pushVideo() {
		 try {
		    // 获取推送规则
		    const pushRules = await db.collection('Push_rules').get();
		    
		    // 遍历推送规则，为每个规则找到符合条件的用户
		    for (const rule of pushRules.data) {
		      const users = await db.collection('Score').where({
		        score: {
		          '$gte': rule.start_score,
		          '$lte': rule.end_score
		        }
		      }).get();
		
		      // 为每个用户推送视频
		      for (const user of users.data) {
		        const video = await db.collection('Videos').doc(rule.video_id).get();
		        
				
		        console.log(`推送视频 ${video.data[0].title} 给用户 ${user.nickname}，分数：${user.score}`);
				
				//加个判断，如果用户已经看过该视频，则不再推送
				const pushRecord = await db.collection('Push_records').where({
					users: user.nickname,
					video_id: video.data[0]._id,
				}).get()
				if (pushRecord.data.length > 0) {
					console.log('该用户已经看过该视频')
					
					continue
				}
				
				
				//将推送记录存入数据库,记录推送的视频id，用户id，推送时间,推送次数+1
				await db.collection('Push_records')
				.add({
					video_id: video.data[0]._id,
					users: user.nickname,
					push_time: new Date(),
				})
				.then(res => {
					console.log('推送记录成功', res)
				})
				.catch(err => {
					console.log('推送记录失败', err)
				})
				
				//更新用户表内的推送次数
				await db.collection('Push_records').where({
					video_id: video.data[0]._id,
				}).update({
					num: db.command.inc(1)
				})
				.then(res => {
					console.log('推送次数更新成功', res)
				})
				.catch(err => {
					console.log('推送次数更新失败', err)
				})
				
				
				
		        // 将推送的视频信息返回给前端
				return result = {
					code: 200,
					msg: "获取视频列表成功",
					data: video.data
				}
									
				
		      }
		    }
		
		    return {
		      status: 'success',
		      message: '推送完成',
			  data: []
		    };
		  } catch (e) {
		    console.error(e);
		    return {
		      status: 'error',
		      errorMessage: e.message
		    };
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
		
		
		
		// return this.params[0].id
		// this.params = JSON.parse(this.getHttpInfo().body)
		// 根据用户id查询分数表
		const collection = db.collection('Score')
		const res = await collection
		.where({
			uid: this.params[0].id,
		})
		.get()
		//将所有该用户的数据存入
		const allScoreList = res.data
		// return allScoreList
		//取出用户昵称
		const nickname = allScoreList[0].nickname
		// return nickname
		
		//取出所有的问卷ID
		const surveysIdList = []
		for (let i = 0; i < allScoreList.length; i++) {
			//如果结果是undefined，则跳过
			if (allScoreList[i].surveysId == undefined) {
				continue
			}
			surveysIdList.push(allScoreList[i].surveysId)
			}
		// return surveysIdList
		//取出所有问题的分数scoreList
		const scoreList = []
		for (let i = 0; i < allScoreList.length; i++) {
			//如果结果是undefined，则跳过
			if (allScoreList[i].score == undefined) {
				continue
			}
			scoreList.push(allScoreList[i].scoreList)
		}
		// return scoreList
		
		
		//根据问卷ID查询推送规则
		let allPushRules = await db.collection('Push_rules').where({
			survey_id: db.command.in(surveysIdList)
		}).get()
		allPushRules = allPushRules.data
		// return allPushRules
		
		//无限制推送列表
		const noLimitPushList = []
		//有限制推送列表
		let limitPushList = []

		
		//根据每个推送规则进行数据处理
		for (let i = 0; i < allPushRules.length; i++) {
			//将每个推送规则的pushDate取出来
			const pushDate = allPushRules[i].pushDate
			//将每个推送规则的pushWeek取出来
			const pushWeek = allPushRules[i].pushWeek
			console.log(pushWeek,pushDate)
			//取出所有视频ID
			const videoId = allPushRules[i].video_id
			//将该规则内的问题ID取出来
			const questionsList = allPushRules[i].questions
			console.log('规则内的问题是',questionsList)
			
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
			console.log(date)
			
			//获取当前时间
			const nowDate = new Date().toLocaleDateString()
			console.log('d',nowDate)
			
			//如果当前时间和推送时间相等，则推送,否则返回空结果
			if (date == nowDate) {
				console.log('推送')
				//判断是否有分数范围限制
				if (allPushRules[i].min_score || allPushRules[i].max_score) {
					//如果有分数范围限制，则根据分数范围进行计算分数
					console.log('有分数范围限制')
					//根据问卷ID查询分数表
					const collection = db.collection('Score')
					let  scoreList = await collection.where({
						surveysId: surveyId}).get()
					//将问题的id取出来
					scoreList = scoreList.data[0].scoreList
					console.log('分数列表是:',scoreList)
					
					let groupScore = 0
					
					scoreList.forEach((item) => {
						console.log('问题列表是',questionsList)
						console.log('得分问题是:',item.questionId)
						//将问题规则列表中的value取出来
						// let valueList = questionsList.map((item) => {
						// 	return item.value
						// })
						// console.log('问题规则列表是',valueList)
						//判断问题的id是否在questionsList数组中
						if (questionsList.includes(item.questionId)) {
							//如果在，则将该问题的分数取出来
							groupScore += item.score1
						}
						
					})
					console.log('总分数是',groupScore)
					//判断分数是否在范围内
					if (groupScore >= allPushRules[i].min_score && groupScore <= allPushRules[i].max_score) {
						//如果在范围内，则推送
						console.log('分数在范围内,视频id是:',videoId)
						//根据视频ID查询视频信息
						const collection = db.collection('Videos')
						const video = await collection
						.where({_id:videoId})
						.get()
						
						//将视频信息加入到推送列表
						limitPushList.push(...video.data)
						console.log(video.data)
						
						//加个判断，如果该用户今天已经推过该视频
						const pushRecord = await db.collection('Push_records').where({
							users: nickname,
							video_id: video.data[0]._id,
							}).get()
						
						//如果推送记录不为空
						if (pushRecord.data.length > 0 ) {
							console.log('该用户今天已经推送过该视频')
							//获取当前时间
							const nowDate = new Date().toLocaleDateString()
							console.log(nowDate)
							//获取推送记录的时间
							const pushTime = new Date(pushRecord.data[0].push_time).toLocaleDateString()
							console.log(pushTime)
							
							//如果推送记录的时间和当前时间相等，则不再推送
							if (nowDate == pushTime) {
								console.log('今天已经推送过该视频')
								
								return result = {
									code: 200,
									msg: "成功",
									data: limitPushList,
								}
							}
						}
						
						//将推送记录存入数据库,记录推送的视频id，用户id，推送时间
						await db.collection('Push_records')
						.add({
							video_id: video.data[0]._id,
							users: nickname,
							push_time: new Date(),
						})
						//更新用户表内的推送次数
						await db.collection('Push_records').where({
							video_id: video.data[0]._id,
						})
						.update({
							num: db.command.inc(1)
						})
						
						
						
						
					}else {
						//如果不在范围内，则不推送
						console.log('分数不在范围内')
						return result = {
							code: 200,
							msg: "成功",
							data: [],
						}
					}
						
				
					
					
				}else {
					//如果没有分数范围限制，则直接推送
					console.log('没有分数范围限制')
					//根据视频ID查询视频信息
					
					const collection = db.collection('Videos')
					const video = await collection.where({_id:videoId}).get()
					//将视频信息加入到推送列表
					noLimitPushList.push(...video.data)
					
					console.log('没分数限制视频是',video.data)
					//加个判断，如果该用户今天已经推过该视频
					const pushRecord = await db.collection('Push_records').where({
						users: nickname,
						video_id: video.data[0]._id,
						}).get()
					
					//如果推送记录不为空
					if (pushRecord.data.length > 0 ) {
						console.log('该用户今天已经推送过该视频')
						//获取当前时间
						const nowDate = new Date().toLocaleDateString()
						console.log(nowDate)
						//获取推送记录的时间
						const pushTime = new Date(pushRecord.data[0].push_time).toLocaleDateString()
						console.log(pushTime)
						
						//如果推送记录的时间和当前时间相等，则不再推送
						if (nowDate == pushTime) {
							console.log('今天已经推送过该视频')
							
							return result = {
								code: 200,
								msg: "成功",
								data: noLimitPushList,
							}
						}
					}
					
					//将推送记录存入数据库,记录推送的视频id，用户id，推送时间
					await db.collection('Push_records')
					.add({
						video_id: video.data[0]._id,
						users: nickname,
						push_time: new Date(),
					})
					//更新用户表内的推送次数
					await db.collection('Push_records').where({
						video_id: video.data[0]._id,
					})
					.update({
						num: db.command.inc(1)
					})
					
					
					
					
					
					
				}
					
			}else {
				console.log('不推送')
				return result = {
					code: 200,
					msg: "成功",
					data: [],
				}
			}
			
			
		}
		console.log('无分数限制推送列表是',noLimitPushList)
		console.log('有分数限制推送列表是',limitPushList)
		
		// //判断返回值判断返回哪个
		if (noLimitPushList.length > 0) {
			return result = {
				code: 200,
				msg: "成功",
				data: noLimitPushList,
			}
		}else if (limitPushList.length > 0) {
				return result = {
					code: 201,
					msg: "成功",
					data: limitPushList,
				}
		}else {
				return result = {
					code: 202,
					msg: "成功",
					data: [],
				}
		}
		
	}
		
		
		
		
	
		
		
	
		
		
		
	
	
	
	
		

	
}
