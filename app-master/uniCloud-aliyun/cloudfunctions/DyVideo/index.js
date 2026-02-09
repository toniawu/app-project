'use strict';
const db = uniCloud.database();
//**
 * 定时删除没有推送记录的 视频的观看记录
 */
exports.main = async (event, context) => {
	 
		// //推送未答题的问卷
		const list = await db.collection('uni-id-users').get();
		 
		
		for (const users of list.data) {
			 
			const vr = await db.collection('Videos_record').where({user_id:users._id}).get();
			const pr = await db.collection('Push_records').where({user_id:users._id}).get();
		 
			const vs = [];
			for (const v of vr.data) {
				vs.push(v.videos_id)
			}
			
			const ps = [];
			for (const p of pr.data) {
				ps.push(p.video_id)
			}
			
			for(var i = 0;i < vs.length;i++){
				let exists = ps.includes(vs[i]);
				if(!exists){
					await db.collection('Videos_record').where({videos_id:vs[i],user_id:users._id}).remove();
				}
			}
			 
			
			 
		}
	  
	  
};
