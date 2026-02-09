const { close } = require("fs");

const db = uniCloud.database();
 //用户问卷关联表
const db_user_questionnaire = "user_questionnaire";
const db_questionnaire = "questionnaire";
module.exports = {
	_before: function () { // 通用预处理器
		this.params = this.getParams() 
	},
	
	// 视频开关:
	async videoOff () {
		return 1; //1 开 2 关
	},
	// 获取轮播图: 
	async getBanner () {
		
		const res = await db.collection('opendb-banner').get();
		return result = {
			code: 200,
			data: res.data,
			msg: '获取成功',
		}
	},
	// 获取问卷编号:
	async getWenId () {
		let params = JSON.parse(this.getHttpInfo().body)
		let res = await  db.collection(db_user_questionnaire)
		.where({user_id:params.uid})
		.orderBy("create_date","desc")
		.get();
		if(res.data && res.data.length>0){
			//获取问卷
			let naire = res.data[0]
			//如果过期60天 默认没有添加问卷
			let now = new Date();
			if(now.getTime()> naire.create_date+60*3600*24*1000){
				return  {
						code: 200,
						msg: '查询成功'
					}
			}
			
			return  {
					code: 200,
					msg: '查询成功',
					data: naire.wen_id
				}
		}
		return  {
				code: 200,
				msg: '查询成功'
		}
			
	},
	
	// 添加问卷编号:
	async setWenId () {
		
		let obj = JSON.parse(this.getHttpInfo().body)
		if(obj&&obj.uid&&obj.wen_id){
			//判断问卷序号是否存在
			let res = await db.collection(db_questionnaire).where({num:Number.parseInt(obj.wen_id)}).get();
			if(res.data && res.data.length>0){
				//问卷
				let qn = res.data[0]
				let now = new Date()
				let nextId = ""
				let nextTime = ""
				if(qn.next_num){
					nextId = Number.parseInt(qn.next_num)
				}
				if(qn.next_interval_day){
					nextTime = Number.parseInt(new Date().getTime()/1000) + 3600*24*Number.parseInt(qn.next_interval_day)
				}
				//清空视频记录
				await db.collection('Push_records').where({user_id:obj.uid}).remove()
				await db.collection('Videos_record').where({user_id:obj.uid}).remove()
				await  db.collection(db_user_questionnaire).add({
					user_id:obj.uid,
					wen_id:obj.wen_id,
					status: 1,
					next_time: nextTime,
					next_id: nextId,
					
					create_date:new Date().getTime()
				})
				return  {
						code: 200,
						msg: '保存成功'
					}
			}else{
				
				return  {
						code: -1,
						msg: '问卷序号不存在'
					}	
			}
			
		}
		return  {
				code: -1,
				msg: '参数有误'
			}	
	
	}
	
	
}
