// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const uniID = require('uni-id-common')
const createConfig = require('uni-config-center')
const uniIm = createConfig({ // 获取配置实例
	    pluginId: 'uni-im' // common/uni-config-center下的插件配置目录名
	})
const uniImConf = uniIm.config() 
const ids = uniImConf.customer_service_uids

module.exports = {
	_before: function () { // 通用预处理器

	},
	/**
	 * is_customer是否客服
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */
	
	async is_customer(param1) {
		const token = this.getUniIdToken()
		if(!token) {
		   return {
				code: -1,
				msg: '',
				data: []
			};
		  }
		  const clientInfo = this.getClientInfo()
		  let uni = uniID.createInstance({ // 创建uni-id实例，其上方法同uniID
		  			clientInfo
		  		})
			const payload = await uni.checkToken(
				token,
				{
				  autoRefresh: false
				}
			  )
			  if (payload.errCode) {
				throw payload
			  }
			  const uid = payload.uid
		if(ids.includes(uid)){
			return {
				code: 1,
				msg: '',
				data: []
			}
		}
		return {
			code: 0,
			msg: '',
			data: ids
		}
	}
	
}
