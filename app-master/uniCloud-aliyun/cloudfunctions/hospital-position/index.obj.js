
//获取医院的位置
const db = uniCloud.database()
const db_hospital_position = "hospital_position"
module.exports = {
	_before: function () { // 通用预处理器

	},
	
	async getNeareatPos(pos) {
		// 参数校验，如无参数则不需要
		if (!pos||!pos.x||!pos.y) {
			return {
				code: -1,
				errMsg: "位置信息不能为空"
			}
		}
		let x = pos.x
		let y = pos.y
		const db_pos = await db.collection(db_hospital_position).get()
		if(db_pos.data&&db_pos.data.length>0){
			//计算最近的三家医院
			let poses = db_pos.data
			for (var i = 0; i < poses.length; i++) {
				var p = poses[i]
				var pos_x = Number.parseFloat(p.pos_x)
				var pos_y = Number.parseFloat(p.pos_y)
				p.distance  = Math.pow((x-pos_x),2)+Math.pow((y-pos_y),2)
				if(!p.distance){
					p.distance = 0
				}
			}
			poses.sort(function(a,b){
				return a.distance - b.distance
			})
			const result=poses.slice(0,3)
			return  {
				code: 1,
				data: result
			}
		}else{
			// 返回结果
			return {
				code: -1,
				errMsg: "医院位置没有设置"
			}
		}
		
	}
	
}
