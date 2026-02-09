// 获取 uni-im 配置
const createConfig = require("uni-config-center");
const uniImConfig = createConfig({
  pluginId: 'uni-im'
})
const getExternalUserinfo = uniImConfig.config('get_external_userinfo')
module.exports = {
	async login(param){
		console.error('login',param)
		let userInfo;
		if (getExternalUserinfo === 'use-param'){
			// 不需要登录验证，直接根据传来的user_id和nickname进行登录
			const { _id, nickname, avatar_file } = param
			userInfo = { _id, nickname, avatar_file }
		}
		else if(getExternalUserinfo){
			// 如果有配置登录验证回调地址,则调用回调地址进行登录验证
			if(!param.token && !param.uni_id_token){
				return {
					errCode: "TOKEN_NOT_EXIST",
					errMsg: '已配置登录验证回调地址，但token不存在',
				}
			}
			if(param.token && param.uni_id_token){
				throw new Error('token和uni_id_token只能存在一个')
			}
			
			const res = await uniCloud.request({
				url: getExternalUserinfo,
				method: 'POST',
				data: param,
				dataType: 'json'
			})
			console.error('getExternalUserinfo',res)
			console.error('getExternalUserinfo',res.data)
			if(res.data.errCode){
				return res.data
			}
			userInfo = res.data.userInfo
		} else {
			throw new Error('请配置登录验证回调地址')
		}
		
		if(!userInfo){
			return {
				errCode: "USER_INFO_NOT_EXIST",
				errMsg: '回调信息缺少用户信息userInfo'
			}
		}
		const checkFields = ['_id','nickname','avatar_file']
		for(let i = 0; i < checkFields.length; i++){
			if(!userInfo[checkFields[i]]){
				return {
					errCode: "USER_INFO_NOT_EXIST",
					errMsg: `回调信息缺少${checkFields[i]}字段`
				}
			}
		}

		const uni_im_ext_uid = userInfo._id
		const useUniIdToken = param.uni_id_token ? true : false
		if(!useUniIdToken){
			delete userInfo._id
		}
		
		// 检查当前用户是否已经注册
		const db = uniCloud.database();
		const query = useUniIdToken ? {"_id": uni_im_ext_uid} : {
			identities:{
				provider: 'uniImExternal',
				uid: uni_im_ext_uid,
			}
		}
		const userRes = await db.collection('uni-id-users').where({...query}).get()
		console.error('userRes',userRes)
		// return
		
		if(userRes.data.length === 0){
			console.error('用户不存在,注册用户',query,[query.identities])
			// 注册用户
			const registerRes = await db.collection('uni-id-users').add({
				identities: useUniIdToken ? null : [query.identities],
				...userInfo,
				create_time: Date.now(),
			})
			console.error('registerRes',registerRes)
			userInfo._id = registerRes.id
		}else{
			console.error('用户存在,更新用户信息')
			// 更新用户信息
			const updateRes = await db.collection('uni-id-users').where(query).update(userInfo)
			console.error('updateRes',updateRes)
			userInfo._id = userRes.data[0]._id
		}
		
		const uniIDIns = require('uni-id-common').createInstance({
			clientInfo: this.getClientInfo()
		})
		const newToken = await uniIDIns.createToken({
			uid: userInfo._id,
			role: userInfo.role
		})
		return {
			errorCode: 0,
			newToken
		}
		
	}
}