// 分数模块
const db = uniCloud.database();
module.exports = {
	_before: function () { // 通用预处理器
		this.params = this.getParams(); // 获取请求参数

	},
	
	// 添加分数到数据库
	async add() {
		this.params = JSON.parse(this.getHttpInfo().body)
		console.log(this.params)
		//将分数添加到数据库,返回成功信息或者失败信息,将答题记录添加到数据库
		const res = await db.collection('Score')
		.add(this.params)
		
		//成功返回成功信息,失败返回失败信息
		if(res.id){
			return {
				code: 200,
				msg: '添加成功'
			}
		}else{
			return {
				code: 500,
				msg: '添加失败'
			}
		}
		
	}
	
	
	
}
