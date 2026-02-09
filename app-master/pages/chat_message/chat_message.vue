<template>
	<view style="height: 100%;background-color: white;">
		<index v-if="kefu==1" class="uni-im-index"></index>
		<chat v-if="kefu==2" :source="1" class="uni-im-chat"></chat>
	</view>
</template>

<script>
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	import chat  from '@/uni_modules/uni-im/pages/chat/chat.vue'
	import index  from '@/uni_modules/uni-im/pages/index/index.vue'
	const chatObj = uniCloud.importObject('chat')
	
	export default {
		components:{
			chat,index
		},
		onLaunch() {
		},
		data() {
			return {
				kefu:0
			}
		},
		onShow() {
			console.log("chatMessageShow");
			this.modifyTabBar()
		},
		onHide() {
			console.log("chatMessageHide");
		},
		methods: {
			async modifyTabBar(){
				//是否是客服				
				//判断是否是客服 查询客服id
				let res1 = await chatObj.is_customer()
				if (res1.code == 1) {
					this.kefu = 1			
					
				} else if(res1.code == 0){
					this.kefu = 2
					//保存客服id
					uni.setStorageSync('cust_id', res1.data[0]);
					
				}else{
					//跳到登录页面
					uni.navigateTo({
						url:'/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
					})
				}
			
			},
		}
	}
</script>

<style lang="scss">
@import "@/uni_modules/uni-im/common/baseStyle.scss";
@import "@/uni_modules/uni-im/pages/index/index.scss";
page {
  height: 100%;
}
.uni-im-chat {
  position: relative;
  height: 500px;
  width: 100%;
  flex: 1;
  background-color: #efefef;
  .msg-list {
    /* height: 1px; 覆盖掉 组件内的height：100%，使得flex-grow: 1作用在容器内被撑开*/
    // height: 1px !important;
    flex-grow: 1;
  }
  
  .chat-foot,.disable-chat-foot{
    position: relative;
    flex-direction: column;
    border-top: 1rpx solid #BBBBBB;
    background-color: #F7F7F7;
  }
  
  .disable-chat-foot{
    padding: 20px;
    text-align: center;
    justify-content: center;
    color: #777777;
  }
  
  .answer-msg {
    padding: 2px 10px;
    background-color: #eee;
    border-radius: 3px;
    margin-bottom: 10px;
    flex-direction: row;
    align-items: center;
    ::v-deep .uni-icons {
      margin-left: 5px;
    }
    /* #ifdef H5 */
    .close-icon{
      cursor: pointer;
    }
    @media screen and (min-device-width:960px){
      margin: 5px;
      margin-bottom: -18px;
      top: 0;
    }
    /* #endif */
    .answer-msg-text {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #333;
    }
	}
  }
</style>
