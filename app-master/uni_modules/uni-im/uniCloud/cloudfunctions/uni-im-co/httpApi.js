const {verifyHttpInfo} = require('uni-cloud-s2s')
module.exports = async function httpApi(modules){
  // console.log('this.getClientInfo()',this.getClientInfo())
  // 校验是否有权限调用
  checkPermission.call(this)
  // 获取 HTTP 请求参数
  const [param,options] = getHttpParams.call(this)
  // 获取模拟操作的用户的信息
  const {userInfo,clientInfo} = options
  this.current_uid = userInfo._id
  // 角色信息
  this.current_user_role = userInfo.role || []
  // 设置客户端信息，例如设置客户端appid
  if (clientInfo){
    this.clientInfo = Object.assign(this.getClientInfo(),clientInfo)
  }
  
  const funcName = Object.keys(param)[0]
  const funcParam = Object.values(param)[0]
  // 执行要调用的方法
  // console.log('funcName:',funcName)
  // console.log('funcParam:',funcParam)
  return await modules[funcName].call(this,funcParam)
}

function checkPermission(){
  if(this.getClientInfo().source != 'http'){
    throw {
      errCode: 'permission-denied',
      errMsg: '仅限制 HTTP 调用'
    }
  }
  // 校验 HTTP 请求是否合法
  verifyHttpInfo(this.getHttpInfo())
}

function getHttpParams(){
  // 获取 HTTP 请求相关信息
  const httpInfo = this.getHttpInfo(); 
  // 获取请求参数
  let params = httpInfo.body 
  // 尝试地将参数转换为 JSON 对象
  try {
    params = JSON.parse(params)
  } catch (_) {}
  
  if (!Array.isArray(params) || (params.length != 2) || !params.every(item => Object.prototype.toString.call(item) === '[object Object]')) {
    throw {
      errCode: 'params-error',
      errMsg: '参数错误：必须是长度为2的数组，且每一项都是对象，如：[{"方法名"："参数"},{"userInfo":{"_id":"执行操作的用户id"},"clientInfo":{"appid":"模拟的客户端appid"}}]'
    }
  }
  return params
}