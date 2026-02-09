const login = require('./login.js')
const httpApi = require('./httpApi.js')
const conversation = require('./conversation.js')
const msg = require('./msg.js')
const push = require('./push.js')
const friend = require('./friend.js')
const group = require('./group.js')
const filtered_conversation = require('./filtered-conversation.js')
const tools = require('./tools.js')
const modules = Object.assign(
  conversation,
  msg,
  push,
  friend,
  group,
  filtered_conversation,
  tools,
  login
)

module.exports = {
  async _before() {
    // 记录请求时间
    this.requestStartTime = Date.now()
    
    // 获取客户端信息
    this.clientInfo = this.getClientInfo()
    
    // 调用扩展插件的初始化接口
    const { invokeExts } = require('uni-im-ext')
    await invokeExts('ext-init',this.clientInfo)

    // 定义uni-id公共模块对象
    const uniIdCommon = require('uni-id-common')
    this.uniIdCommon = uniIdCommon.createInstance({
      clientInfo: this.clientInfo
    })
    
    // 除非特定方法允许未登录用户调用，其它都需要验证用户的身份
    const allowedMethodsWithouLogin = ["httpApi","login"]
    if (!allowedMethodsWithouLogin.includes(this.getMethodName())) {
      if (this.getClientInfo().source == 'function') {
        // 云函数互调时，免校验 token 直接使用传来的用户 id
        this.current_uid = this.getParams()[1]
        this.current_user_role = []
      } else {
        // 客户端调用时验证 uni-id token
        let res = await this.uniIdCommon.checkToken(this.clientInfo.uniIdToken)
        // console.log('checkToken res',res);
        if (res.errCode) {
          // 如果token校验出错，则抛出错误
          throw res
        }
				const {token,tokenExpired} = res
				this.hasNewToken = token ? {token,tokenExpired} : false
				
        // todo:临时禁用IM的用户，临时方案用于突发情况。当用户二次登录时，role会自动带disable_im
        const tmpBlackUid = []
        if (res.role.includes('disable_im') || tmpBlackUid.includes(res.uid)) {
          // 如果用户被禁用IM，则抛出错误
          throw {
            errSubject: 'uni-im-co',
            errCode: 'USER_DISABLED_IM',
            errMsg: '你的账号，已被禁止使用uni-im'
          }
        }

        // token 有效，取出 id 和角色
        this.current_uid = res.uid
        this.current_user_role = res.role
      }
    }

    // 为方便云对象内部调用 sendPushMsg() 方法，把它挂在云对象实例上
    this.sendPushMsg = push.sendPushMsg

    // 提供一个方法，用于添加并发任务
    this._promises = []
    this.addPromise = (promise) => {
      this._promises.push(promise)
    }
  },
  
  async _after(error, result) {
    // 请求完成时间
    // console.error('请求完成时间', Date.now() - this.requestStartTime, 'ms')
    
    if (error) {
      console.error( '云对象_after发现错误' + error.message,JSON.stringify({error,result}) );
      console.error({
        "getMethodName":this.getMethodName(),
        "getParams":this.getParams(),
        "getClientInfo":this.getClientInfo()
      });
      console.error(error.stack)
      if (error.errCode && error.errMsg) {
        // 符合响应体规范的错误，直接返回
        return error
      } else {
        return {
          errSubject: "uni-im-co",
          errCode: "unicloud throw error",
          errMsg: error.message
        }
      }
    }

    // 如果有并发任务，则等它们都执行完再返回
    if (this._promises.length > 0) {
      await Promise.all(this._promises)
    }
    
    // console.error('云函数结束时间', Date.now() - this.requestStartTime, 'ms')
		
		if (this.hasNewToken) {
			// console.error('this.hasNewToken',this.hasNewToken)
			// 返回新的 token
			result.newToken = this.hasNewToken
		}
    return result || { errCode: 0 }
  },
  ...modules,
  httpApi(){
    return httpApi.call(this,modules)
  }
}
