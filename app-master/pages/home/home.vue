<template>
	<view class="warp" v-if="quan == 1">
		 
		<!-- banner -->
		<unicloud-db ref="bannerdb" v-slot:default="{data, loading, error, options}" collection="opendb-banner"
			field="_id,bannerfile,open_url,title" @load="onqueryload">
			<!-- 当无banner数据时显示占位图 -->
			<image v-if="!(loading||data.length)" class="banner-image" src="/static/uni-center/headers.png" mode="aspectFill" :draggable="false" />
			
			<swiper v-else class="swiper-box" @change="changeSwiper" :current="current" indicator-dots>
				<swiper-item v-for="(item, index) in bannerList" :key="item._id">
					<!-- 如果banner的状态为true则显示 -->
					<image class="banner-image" :src="item.bannerfile.url" mode="aspectFill" :draggable="false" />
					
					
				</swiper-item>
			</swiper>
		</unicloud-db>

	
		
		<view class="fastEntry">
			<view class="left" >
				<button @click="goMap" type="primary" 
				style="background-color: #e0e5f9;color: black; ">预约报名</button>
			</view>
			<view style="flex:1"></view>
			<view class="right">
				<button @click="agreeReport" type="primary" 
				style="background-color: #faebf0;color: black; ">问卷调查</button>
			</view>
		</view>
		<!-- 视频精选 -->
	  <view class="section-box" style="width: 100%;" v-if="videobool == 1">
		<view style="height: 60rpx;display: flex;flex-direction: row; align-items: center; 
		padding-left: 15rpx;padding-top: 10rpx;padding-bottom: 10rpx;">
			<text class="section-text">科普专栏</text>
		</view>
		
		<view class="videoSelection" v-if="videobool == 1">
		  <view v-for="video in selectedVideos" :key="video._id" 
		  class="video-item" @click="goVideoDetail(video._id, video.title)">
		  <view class = "video-item1">
			  <image class="video-thumbnail" :src="video.cover.url" mode="scaleToFill" :draggable="false" />
			  <text class="video-title">{{ video.title }}</text>
		  </view>
			
		  </view>
		</view>
	  </view>
	
	 
		
		<!-- 遮罩层 -->
		<view class="mask" v-show="showMask" @click="hidePopup"></view>  
		<!-- 弹出层 -->  
		<view class="popup" v-show="showPopup" > 
			<view class="des">
				请输入问卷编号：
			</view>
			 <view class="input">
				<input type="text"  class="form121"  v-model="wen_id"/>
			 </view>
			 <view class="but">
					<button @click="sub">确定</button>
			 </view>
		</view> 
		<uni-popup ref="popup" background-color="#fff" borderRadius='12px 12px 0px 0px'>
			<view class="popup-content" :class="{ 'popup-height': type === 'left' || type === 'right' }">
				<view class="popupTitle">“两癌”筛查政策介绍</view>
				<view class="popupContent">
					“两癌筛查”是我国从2009年起实施的重大惠民工程，2019年起纳入基本公共卫生服务项目。为提高广大女性自我保健意识和健康水平，基层卫生服务机构每年组织开展“两癌筛查”工作：
				</view>
				<view class="popupTitle1">
					一、筛查项目
				</view>
				<view class="popupContent1">
					宫颈癌筛查、乳腺癌筛查。
				</view>
				<view class="popupTitle1">
					二、筛查对象
				</view>
				<view class="popupContent1">
					1、年龄在35至64周岁之间的非妊娠期、非哺乳期女性。
				</view>
				<view class="popupContent1">
					2、过去5年内未接受过以HPV DNA为初筛方法的宫颈癌筛查，且初筛结果为阴性。
				</view>
				<view class="popupContent1">
					3、过去3年内未接受过细胞学筛查的宫颈癌筛查，且初筛结果为阴性。
					符合条件的适龄女性在规定周期内可免费享受一次检查。不符合免费筛查政策的人员可进行自费检查。
				</view>
				<view class="popupTitle1">
					三、筛查要求
				</view>
				<view class="popupContent1">
					1、自愿原则：筛查基于自愿，是保障妇女健康的重要措施。通过筛查，尽早发现宫颈癌和乳腺癌，实现早发现、早诊断、早预防、早治疗。
				</view>
				<view class="popupContent1">
					2、健康教育：加强健康教育宣传，确保每位符合条件的女性了解“两癌筛查”的重要性，保障她们的知情权和选择权。
				</view>
				<view class="popupContent1">
					3、避开经期：申请筛查的女性应避免在经期进行检查。
				</view>
				<view class="popupButton" @click="closePopup">我已了解</view>
			</view>
		</uni-popup>
		<uni-popup ref="popup1" background-color="#fff" borderRadius='12px 12px 0px 0px'>
			<view class="popup-content" :class="{ 'popup-height': type === 'left' || type === 'right' }">
				<view class="popupTitle11">宫颈癌：中国低卫生资源地区宫颈癌筛查意愿及干预技术研究知情同意书（整群随机对照试验）</view>
				<view class="popupContent">
					尊敬的参加者：
					    宫颈癌是危害女性健康的常见恶性肿瘤，造成了全球8%的女性癌症相关死亡，成为女性癌症相关死亡的四大原因之一。通过完备的三级预防手段，宫颈癌可通过接种HPV疫苗和接受筛查而实现全面防治的肿瘤。随着全球消除宫颈癌进程的推动，我国政府也将其宫颈癌防控纳入实现“健康中国2030”战略目标的优先事项。然而，目前35-64岁妇女的宫颈癌筛查参与率仅为30%左右。
					因此，为进一步解决我国宫颈癌筛查低下的现状，北京协和医学院群医学及公共卫生学院拟开展一项中国低卫生资源地区宫颈癌筛查意愿及干预技术研究。在您参加此项目之前，请您仔细阅读这份知情同意书并慎重做出是否参加本项目的决定。您可以向您的医生/社区卫生工作者/项目管理人员询问任何您不懂的地方，让他/她给您解释，直到您完全理解为止。
					本项目的主要内容如下。
				</view>
				<view class="popupTitle1">
					一、项目目的
				</view>
				<view class="popupContent1">
					本研究旨在通过定性研究，从35-64岁女性的角度探讨低卫生资源地区宫颈癌防控的阻碍和促进因素；并通过整群随机对照试验，评估干预技术的干预效果。
				</view>
				<view class="popupTitle1">
					二、项目内容	
				</view>
				<view class="popupContent1">
					我们邀请您参与整群随机对照试验，填写基线调查问卷，并根据您在的乡镇/社区参与不同的宫颈癌筛查动员干预手段，干预完成后收集您参与宫颈癌筛查意愿的调查问卷和实际参与宫颈癌筛查情况。
				</view>				
				<view class="popupTitle1">
					三、可能的风险和受益
				</view>
				<view class="popupContent1">
					可能的风险：本研究对参与者没有身体伤害，项目过程中如遇到任何疑问您可以向项目管理人员或伦理委员会咨询。
					可能的受益：您参加此项目将会获得小礼品（日常生活用品）。通过本项研究，您的参与会影响后期提升筛查依从率的方案实施，帮助未来更多的女性参与宫颈癌筛查。
				</view>
				<view class="popupTitle1">
					四、​个人信息的保密
				</view>
				<view class="popupContent1">
					收集完成后，您的数据将以脱敏的形式保存。任何有关本项研究结果的公开报告将不会披露您的个人身份。</view>	
				<view class="popupTitle1">
					五、自愿参加
				</view>
				<view class="popupContent1">
					本次项目的参与是完全自愿的，如果遇到敏感或不想回答的问题可以随时拒绝，并可随时无条件退出而无需任何理由，且退出绝不会影响您和医务人员及工作人员的关系。
				</view>	
				<view class="popupTitle1">
					六、联系人及联系方式
				</view>
				<view class="popupContent1">
					如果您对本项目有任何疑问，可以向研究者提出有关本项研究的任何问题，并得到相应的解答。
					丁晗玥 北京协和医学院群医学及公共卫生学院 18701635308
					王敏   北京协和医学院群医学及公共卫生学院 13581524637
				</view>
				<view class="popupTitle1">
					我们诚挚地感谢您参加本次研究！
				</view>		
				<view class="popupButton1" @click="agree">我自愿参与本研究</view>
				<view class="popupButton2" @click="refuse">我拒绝参与本研究</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	 import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	// #ifdef APP-PLUS
	import statusBar from "@/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-status-bar";
	// #endif
	import {
		store,
		mutations
	} from '@/uni_modules/uni-id-pages/common/store.js'
import getCloudMsg from '../../uni_modules/uni-im/sdk/init/getCloudMsg';
	
	const todo = uniCloud.importObject('user_op_obj')
	export default {
		// #ifdef APP-PLUS
		components: {
			statusBar
		},
		// #endif
		data() {
			return {				
				quan:0,
				videobool:0,
				wen_id:'',
				showMask: false, // 控制遮罩层显示与隐藏
				showPopup: false, // 控制弹出层显示与隐藏  
				current: 0,
				hasLogin:false,
				bannerList : [],
				videoList: [], // 添加视频列表数据
				selectedVideos: [], // 存储随机选择的视频
				isMessage:false ,// 是否订阅模版消息
				isQuestionnaire: false,
				questionnaireId:''
			}
		},
		
		onShow() {

			this.hasLogin = uniCloud.getCurrentUserInfo().tokenExpired > Date.now()
			this.getWenId()
		},
		onReady() {
			this.updateUnread()
		},
		
		mounted() {
			this.videoOff()
			this.getBanner()
			this.getVideos() // 获取视频列表
			this.getWenId()
			this.setMessage()
		},
		methods: {
			updateUnread() {
				setTimeout(() => {			
				 let unreadMsgCount = uniIm.conversation.unreadCount()
				 uniIm.utils.setTabBarBadge(2, unreadMsgCount)
				  // 设置底部选项卡角标值
				}, 2000);
				// 所有会话的未读消息数
				
			},
			
			videoOff(){
				uni.request({
					url:"https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/banner/videoOff"
				}).then(res=>{
					this.videobool = res.data
					this.quan = 1
				})
			},			
			getShow(){
				this.getBanner()
			},
			async agreeReport(){
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				let userId = userInfo._id
				let res = await todo.queryOp(userId,2)
				
				if(res.data == 0){
					this.$refs.popup1.open('bottom')
				}else{
					this.requestSubscribeMessage();
				}
			},
			//知情同意
			async agree(){
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				let userId = userInfo._id
				
				let res = await todo.savaOp(userId,2,1)
				
				this.$refs.popup1.close()
				this.requestSubscribeMessage();
			},
			refuse(){
				this.$refs.popup1.close()
			},
			//订阅消息
			requestSubscribeMessage() {
				
				var tmp1 = 'M5t4KOuKxEh_w8bkDY40MrEc2LZKNLC5md4U_wCmRRg';
				var tmp2 = 'ejc2fjY4BZ7JqDuYV4rW4x2byGybZhCw009N4d7AhW4';
				var tmp3 = '7_tDJv2IAYHG3xE-qp54HqZDPQMvjMDMGTBYesSbqrI';
				
				if(!this.isMessage){
					uni.requestSubscribeMessage({
						tmplIds: [tmp1,tmp2,tmp3], // 改成你的小程序订阅消息模板id
						success: (e) => {
							uni.showToast({
								title: "订阅成功",
								icon: "none"
							})
							this.isMessage = true
							if(this.isQuestionnaire){
								this.sub()
							}else{
								this.showPopup1()
							}
						} 
					});
				}else{
					if(this.isQuestionnaire){
						this.sub()
					}else{
						this.showPopup1()
					}
				}
				
				
			   
			},
			//调用
			sendPushMessage(){
				uni.request({
					url:"https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/banner/pushMessage"
				}).then(res=>{})
			},
			
			//发送通知
			showPopup1() {
			  this.showMask = true;  
			  this.showPopup = true;  
			},  
			hidePopup1() {  
			  this.showMask = false;  
			  this.showPopup = false; 
			},
			sub(){
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				if(userInfo&&userInfo._id){
					let userId = userInfo._id
					if(this.questionnaireId && this.questionnaireId != ''){
						uni.navigateTo({
							url: '/pages/questionsList/questionsList'
						});
					}else{
						uni.request({
						 	url:"https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/banner/setWenId",
						 	method: 'POST', 
						 	data:{'uid':userId,'wen_id':this.questionnaireId == '' ? this.wen_id : this.questionnaireId },
						 	success: (res) => {
								console.log(res);
								if(res.data.code == 200){
									this.hidePopup1()
									uni.navigateTo({
										url: '/pages/questionsList/questionsList'
									});
								}else{
									uni.showToast({
										title: res.data.msg,
										icon: 'error'
									});
								}
								 
							},
						})
					}
				}else{
					//未登录 跳转登录页
					uni.navigateTo({
						url:'/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
					})
				}
				
			},
			
			//获取用户是否填写问卷编号
			getWenId(){
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				let userId = uniCloud.getCurrentUserInfo().uid
				console.log('用户编号',userId)
				uni.request({
				 	url:"https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/banner/getWenId",
				 	method: 'POST',
				 	data:{'uid':userId},
				 	success: (res) => {
						console.log('获取问卷数据',res)
						const wenid = res.data.data;
						 if(wenid&&wenid != ''){
							 this.isQuestionnaire = true
							 this.questionnaireId = wenid					 
						 }else{
							this.isQuestionnaire = false
						 }
					},
				})
				 
			 
			},
			//请求用户订阅消息：
			setMessage(){
				
				var tmp1 = 'M5t4KOuKxEh_w8bkDY40MrEc2LZKNLC5md4U_wCmRRg';
				var tmp2 = 'ejc2fjY4BZ7JqDuYV4rW4x2byGybZhCw009N4d7AhW4';
				var tmp3 = '7_tDJv2IAYHG3xE-qp54HqZDPQMvjMDMGTBYesSbqrI';
				
				uni.getSetting({
					withSubscriptions: true,
					success: (res) => {
						if(res.subscriptionsSetting.itemSettings[tmp1] == "accept"&&
							res.subscriptionsSetting.itemSettings[tmp1] == "accept"&&
							res.subscriptionsSetting.itemSettings[tmp1] == "accept"){
							this.isMessage = true
						}
					}
				});

			},
			//微信登录
			wxLogin(){
				wx.login({
					provider: 'weixin',
					success: (res) => {
						console.log('微信登录成功', res)
						this.hasLogin = true
					},
					fail: (err) => {
						console.log('微信登录失败', err)
					}
				});
			},
			
			//获取banner
			getBanner(){
				uni.request({
					url:"https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/banner/getBanner"
				}).then(res=>{
					this.bannerList = res.data.data
					//做一个banner的状态判断,如果是false则剔除数据列表
					// this.bannerList = this.bannerList.filter(item => item.status == true)
					this.bannerList.sort(function(a, b) {
					return  b.sort- a.sort;
					});
					
				})
			},
			
			// 获取视频列表
			getVideos(){
				let that = this
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				let userId = uniCloud.getCurrentUserInfo().uid
				 console.log('获取视频列表');
				uni.request({
				 	url: 'https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/push/getSelectedVideos',
				 	method: 'GET',					
				 	error: (e) => {
						console.log("获取视频列表",e);
					},
				 	success: (res) => {
						if(res.data != ''){
							that.videoList = res.data
							that.selectRandomVideos()
						}
					},
				})
				 
			},
						
			// 随机选择2-3个视频
			selectRandomVideos() {
				let count = Math.min(this.videoList.length, 4)
				this.selectedVideos = this.videoList.sort(() => 0.5 - Math.random()).slice(0, count)
			},
			created() {
			    this.getAllVideo();
			  },
			
			//去消息通知列表
			goList(){
				console.log('去消息通知列表')
				uni.switchTab({
					url: '/pages/list/list'
				});
			},
			//预约弹窗打开
			async goMap(){
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				let userId = userInfo._id
				
				let res = await todo.queryOp(userId,1)
				
				if(res.data == 0){
					this.toggle('bottom')
				}else{
					uni.navigateTo({
						url: '/pages/myMap/myMap'
					});
				}
				// this.toggle('bottom')
			},
			
			// 控制弹窗出现位置
			toggle(type) {
				this.type = type
				// open 方法传入参数 等同在 uni-popup 组件上绑定 type属性
				this.$refs.popup.open(type)
			},
			// 弹窗关闭事件
			async closePopup(){
				
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				let userId = userInfo._id
				
				let res = await todo.savaOp(userId,1,1)
				
				this.$refs.popup.close()
				
				uni.navigateTo({
					url: '/pages/myMap/myMap'
				});
			},
			
			// 点击蒙层事件
			clickMask(){
				
				this.$refs.popup.close()
				
			},
			
			//去问卷列表
			goQuestion(){
				this.showPopup1()
				
				// uni.navigateTo({
				// 	url: '/pages/questionsList/questionsList'
				// });
			},
			
			// 点击视频进入详细页面
			goVideoDetail(videoId, title) {
				console.log(`Navigating to video detail: ${videoId}, ${title}`);
					uni.navigateTo({
						url: `/pages/list/detail?id=${videoId}&title=${title}`
					});
			}, 
			
			
			
			
			change(e) {
				uni.showToast({
					title:this.$t('grid.clickTip') + " " + `${e.detail.index + 1}` + " " + this.$t('grid.clickTipGrid'),
					icon: 'none'
				})
			},
			/**
			 * banner加载后触发的回调
			 */
			onqueryload(data) {
			},
			changeSwiper(e) {
				this.current = e.detail.current
			},
			/**
			 * 点击banner的处理
			 */
			clickBannerItem(item) {
				// 有外部链接-跳转url
				if (item.open_url) {
					uni.navigateTo({
						url: '/uni_modules/uni-id-pages/pages/common/webview/webview?url=' + item.open_url + '&title=' + item.title,
						success: res => {},
						fail: () => {},
						complete: () => {}
					});
				}
				// 其余业务处理
			}
		}
	}
</script>

<style lang="scss" scoped>
	 .mask {
	   position: fixed;  
	   top: 0;  
	   left: 0;  
	   width: 100%;  
	   height: 100vh;  
	   background-color: rgba(0, 0, 0, 0.6); /* 半透明黑色 */  
	   z-index: 99; /* 确保遮罩层在弹出层下方 */  
	 }  
	 
	 .popup-content{
		 height: 60vh;
		 overflow-y: scroll;
		 padding: 0 24px;
		 border-top-left-radius: 16px;
	 }
	 .popup-content::-webkit-scrollbar{
		 display: none;
	 }
	.popupTitle{
		text-align: center;
		font-weight: 800;
		margin-top: 24px;
		font-size: 16px;
	}
	.popupTitle11{
		text-align: left;
		font-weight: 800;
		margin-top: 24px;
		font-size: 16px;
	}
	.popupContent{
		margin-top: 12px;
		text-indent: 2em;
	}
	.popupTitle1{
		font-size: 14px;
		font-weight: 600;
		margin-top: 12px;
		margin-bottom: 12px;
	}
	.popupContent1{
		text-indent: 2em;
	}
	.popupButton{
		width: calc(100vw - 48px);
		height: 32px;
		background-color: palevioletred;
		margin: 0 auto;
		margin-top: 24px;
		text-align: center;
		line-height: 32px;
		font-size: 16px;
		color: #ffffff;
		border-radius: 16px;
	}
	.popupButton1{
		width: calc(100vw - 48px);
		height: 32px;
		background-color: #008CBA;
		margin: 0 auto;
		margin-top: 10px;
		text-align: center;
		line-height: 32px;
		font-size: 16px;
		color:#ffffff;
		border-radius: 16px;
	}
	.popupButton2{
		width: calc(100vw - 48px);
		height: 32px;
		background-color: #f44336;
		margin: 0 auto;
		margin-top: 10px;
		text-align: center;
		line-height: 32px;
		font-size: 16px;
		color:#ffffff;
		border-radius: 16px;
		margin-bottom: 10px;
	}
	 .popup {  
	   /* 弹出层的样式设置 */  
	   position: fixed;  
	   width: 85%;
	   height: 1000rpx;
	   top: 50%;  
	   left: 50%;  
	   transform: translate(-50%, -50%);  
	   /* 其他样式如宽度、高度、背景色等 */  
	   z-index: 10000; /* 确保弹出层在遮罩层上方 */  
	   // background-image: url("../../styles/image/miandan/tk.png");
	   // background-position: center; /* 背景图片居中显示 */ 
	   background-size: 100%;
	   background-repeat: no-repeat;
	   color: red;
	 }
	 .input{
		 width: 100%;
		 height: 120rpx;
		  color: red;
		   border-bottom:1rpx solid white;
		  // border: 1rpx solid red;
	 }
 
	 .form121 {
		 height: 120rpx;
		 line-height: 120rpx;
		 font-size: 30rpx;
		 color: white;
		 padding-left: 30rpx;
		 
	 }
	 .but{
		 margin-top:100rpx;
		 // width:50%;
		 // margin:0 auto;
	 }
	 
	
	.warp {
		  background-color: #f0f0f0; /* 新增背景颜色 */
		  padding: 20rpx; /* 添加内边距 */
		}
	/* 新版样式 */
	.fastEntry {
		display: flex;
		flex-direction: row;
		padding-top: 10rpx;
		padding-bottom: 20rpx;
		.left {
			width:45vw;
			height: 100rpx;
			margin-left: 0rpx;
		}
		.right {
			width:45vw;
			height: 100rpx;
			margin-right: 0rpx;
		}
		
	}
	.des{
		color:white;
		font-size:30rpx;
		width: 100%;
		height: 60rpx;
		line-height: 60rpx;
	}
	
	
	
	
	
	
	
	/* 旧版样式 */
	/* #ifndef APP-NVUE */
	page {
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		background-color: #fff;
		min-height: 100%;
		height: auto;
	}
	view {
		font-size: 14px;
		line-height: inherit;
	}
	
	.banner-image {
	  width: 100%; /* 修改宽度为100% */
	  height: 30vh; /* 修改高度为视窗高度的30% */
	}
	
	.swiper-box {
	  width: 100%;
	  height: 30vh; /* 修改高度为视窗高度的30% */
	}

	.example-body {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		padding: 0;
		font-size: 14px;
		background-color: #ffffff;
	}
	/* #endif */
	
	.section-box{
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		align-items: left;
		padding: 5rpx;
		background-color: #fd6095;
	}
	.decoration{
		width: 4px;
		height: 12px;
		border-radius: 5px;
		background-color: #B59C9C;
	}
	.section-text {
	  color: #ffffff;
	  font-size: 40rpx; 
	}

	/* #ifdef APP-NVUE */
	.warp {
		background-color: #fff;
	}
	/* #endif */

	.example-body {
		flex-direction: column;
		padding: 15px;
		background-color: #ffffff;
	}

	.image {
		width: 50rpx;
		height: 50rpx;
	}
	
	.big-number{
		font-size: 50rpx;
		font-weight: 700;
		font-stretch: condensed;
		font-style:oblique;
	}
	
	.text {
		text-align: center;
		font-size: 26rpx;
		margin-top: 10rpx;
	}

	.example-body {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
	}

	.grid-item-box {
		flex: 1;
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 15px 0;
	}

	.banner-image {
		// width: 750rpx;
		// height: 400rpx;
		width: 100%; /* 修改宽度为100% */
		height: 30vh; 
	}

	.swiper-box {
		// height: 400rpx;
		width: 100%; /* 修改宽度为100% */
		height: 30vh; 
	}

	.search-icons {
		padding: 16rpx;
	}

	.search-container-bar {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		justify-content: center;
		align-items: center;
		position: fixed;
		left: 0;
		right: 0;
		z-index: 10;
		background-color: #fff;
	}
	
	.videoSelection {
	  display: flex;
	  flex-direction: column;
	  overflow: hidden;
	  border-radius: 10px;
	}
	.video-item {
		display: flex;
		flex-direction: row;
	  cursor: pointer;
	  width: 100%; /* 设置宽度为48%，留出间隙 */
	  
	  padding-left: 20rpx;
	  padding-right: 20rpx;
	  padding-top: 20rpx;
	  padding-bottom: 20rpx;
	  border-radius: 5rpx;
	  transition: transform 0.3s;
	  background-color: white;
	}
	.video-item:hover {
	  transform: scale(1.05);
	}
	.video-item1 {
	  border-bottom: 1px solid #ddd;
	  display: flex;
	  flex-direction: row;
	   padding-bottom: 20rpx;
	}
	.video-item1:hover {
	  transform: scale(1.05);
	}
	.video-thumbnail {
	  width: 20vw;
	  height: 10vh; /* 自动调整高度 */
	  // aspect-ratio: 16/9; /* 保持16:9比例 */
	  border-radius: 5rpx;
	}
	.video-title {
	  width: 65vw;
	  margin-top: 20rpx;
	  margin-left: 20rpx;
	  font-size: 35rpx; /* 调整字体大小 */
	  font-weight: bold; /* 加粗标题 */
	  color: #333333; /* 深灰色 */
	}

	/* #ifndef APP-NVUE || VUE3*/
	::v-deep
	/* #endif */
	.uni-searchbar__box {
		border-width: 0;
	}

	/* #ifndef APP-NVUE || VUE3 */
	::v-deep
	/* #endif */
	.uni-input-placeholder {
		font-size: 28rpx;
	}
</style>
