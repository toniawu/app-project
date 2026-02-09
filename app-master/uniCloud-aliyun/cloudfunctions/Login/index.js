'use strict';
 
//小程序的AppID 和 AppSecret
const appid = "wx1aac87254c85ab91"
const secret = "49a78c0b4d53336650e50cae604d9451"
// 创建user数据表实例
const db = uniCloud.database()
const user = db.collection('user')
 
// 生成token和校验token公共模块
const {getToken,verifyToken} = require('wx-common')
 
exports.main = async (event, context) => {
 
    //获取用户openid和session_key
	const res = await uniCloud.httpclient.request('https://api.weixin.qq.com/sns/jscode2session', {
		method: 'GET',
		data: {
			appid: appid,
			secret: secret,
			js_code: event.code,// 客户端传递过来的code
			grant_type: 'authorization_code'
		},
		dataType: 'json'
	})
    //判断请求用户openid和session_key是否成功
	if (res.status === 200) {
        //成功返回的openid和session_key
		const wx_openid = res.data.openid
		const wx_session_key = res.data.session_key
		// 生成token
		const token = getToken(wx_openid)
        //查询数据库判断用户是否已经注册 根据openid查找
		const res_user = await user.where({
			openid: wx_openid
		}).get()
        //用户未注册存储用户信息
		if (res_user.data && res_user.data.length === 0) {
			user.add({
				avatarUrl: event.userinfo.avatarUrl,
				nickName: event.userinfo.nickName,
				gender: event.userinfo.gender,
				openid: wx_openid,
				session_key: wx_session_key,
				mobile:"",
				token:token
			})
		} else {
        //用户已经存在更新token和session_key
			user.where({
				openid: wx_openid
			}).update({
				session_key: wx_session_key,
				token:token
			})
		}
        //将需要的个人信息返回到客户端例如:头像 昵称 等
		return user.where({
			openid: wx_openid
		}).field({
			avatarUrl: true,
			gender: true,
			nickName: true,
			mobile:true,
			token:true,
		}).get()
 
	} else {
    //获取用户openid和session_key失败响应客户端
		return {
			msg: '获取微信服务失败',
			code: 500
		}
	}
};