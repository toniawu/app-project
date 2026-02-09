// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
const db_uol =  'user_op_log'//视频观看记录
module.exports = {
	_before: function () { // 通用预处理器

	},
	/**
	 * 记录用户点击 我已了解 的状态
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */
	async savaOp(userId,opType,opStatus) {
		// 业务逻辑
		const res = await db.collection(db_uol).where({user_id:userId,op_type:opType}).get();
		if(res.data&&res.data.length>0){
			//如果已经存在 更新
			let userOpLog = res.data[0]
			userOpLog.op_type = opType
			userOpLog.op_status = opStatus
			await db.collection(db_uol).doc(userOpLog._id).update({
				op_status:opStatus
			})
		}else{
			//新增一条
			await db.collection(db_uol).add({
				user_id:userId,
				op_type:opType,
				op_status:opStatus,
				create_date:new Date()
			})
		}
		// 返回结果
		return  {
				code: 200,
				msg: '成功'
			}
	},
	
	async queryOp(userId,opType) {
		// 业务逻辑
		const res = await db.collection(db_uol)
		.where({
			user_id:userId,
			op_type:opType
			}).get();
		if(res.data&&res.data.length>0){
			// 返回结果
			return  {
					code: 200,
					msg: '成功',
					data : res.data[0].op_status
				}
		}else{
			// 返回结果
			return  {
					code: 200,
					msg: '成功',
					data : 0
				}
		}
		
	}
}
