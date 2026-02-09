const db = uniCloud.database();
module.exports = {
	_before: function () { // 通用预处理器
		this.params = this.getParams() 
	},
	// 获取轮播图: 
	async getBanner () {
		const res = await db.collection('opendb-banner').get();
		return result = {
			code: 200,
			data: res.data,
			msg: '获取成功',
		}
	}
	
	
}
