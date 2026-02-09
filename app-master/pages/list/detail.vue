<template>
	<!--
	 本页面模板教程：https://ext.dcloud.net.cn/plugin?id=2717
	 uni-list 文档：https://ext.dcloud.net.cn/plugin?id=24
	 uniCloud 文档：https://uniapp.dcloud.io/uniCloud/README
	 unicloud-db 组件文档：https://uniapp.dcloud.net.cn/uniCloud/unicloud-db-component
	 DB Schema 规范：https://uniapp.dcloud.net.cn/uniCloud/schema
	 -->
	<view class="article" v-if="quan == 1 ">
		<!-- #ifdef APP-PLUS -->
		<uni-nav-bar :statusBar="true" :border="false"></uni-nav-bar>
		<!-- #endif -->
		<!-- 标题 -->
		<view class="article-title">{{ videoInfo.title }}</view>
		<!-- 视频展示 -->
		<view class="video" v-if="videobool == 1">
			<video   
			   ref="myVideos"
			   id="myVideo"   
			   :src="viedoSrc"  
			   controls   
			   autoplay="false"   
			   style="width: 100%; height: 150px;"  
			   @timeupdate="handleTimeUpdate"
			   @loadedmetadata="handleLoadedMetadata"
			  
			 ></video>
		</view>
		<view class="footer" style="margin-left: 30rpx;margin-top: 20rpx;"  v-if="videobool == 1">
			<view class="uni-note">更新于
				<uni-dateformat :date="videoInfo._creatTime" format="yyyy-MM-dd hh:mm"
					:threshold="[60000, 2592000000]" />
			</view>
		</view>
		<!-- 文章详情 -->
		<view class="article-content">
			<!-- <rich-text :nodes="videoInfo.desc"></rich-text> -->
			<rich-text :nodes="pList"></rich-text>
		</view>
		
		
		
		
	</view>
</template>

<script>
	// #ifdef APP
	import UniShare from '@/uni_modules/uni-share/js_sdk/uni-share.js';
	import uniNavBar from '@/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.vue';
	const uniShare = new UniShare()
	// #endif
	const db = uniCloud.database();
	const readNewsLog = db.collection('read-news-log')
	const videorecord = db.collection('Videos_record')
	//推送记录
	const db_Push_records = db.collection('Push_records')
	export default {
		// #ifdef APP
		components:{
			"uni-nav-bar":uniNavBar
		},
		onBackPress({from}) {
			if(from == 'backbutton'){
				if(uniShare.isShow){
					this.$nextTick(function(){
						console.log(uniShare);
						uniShare.hide()
					})
				}
				return uniShare.isShow;
			}
		},
		// #endif
		data() {
			return {
				pushRecord:{},
				quan:0,
				videobool:0,
				// 当前显示 _id
				id: "",
				title: 'title',
				// 数据表名
				// 查询字段，多个字段用 , 分割
				field: 'user_id.nickname,user_id._id,avatar,excerpt,last_modify_date,comment_count,like_count,title,content',
				formData: {
					noData: '<p style="text-align:center;color:#666">详情加载中...</p>'
				},
				
				videoFit: 'contain' ,// 视频的适应方式，可选值：contain、fill、cover
				
				viedoSrc: '',
	 
				videoInfo:{},
				// pList: [],
				pList: '<p>这是一段富文本</p><p>这是二段富文本</p><p>这是三段富文本</p>',
				currentTime: 0, // 用于存储当前播放时间 
				duration:0,//视频总时长
				startTime:0,//视频从多少秒开始播放
				
			}
		},
		computed: {
			uniStarterConfig() {
				return getApp().globalData.config
			},
			where(){
				//拼接where条件 查询条件 ,更多详见 ：https://uniapp.dcloud.net.cn/uniCloud/unicloud-db?id=jsquery
				return `_id =="${this.id}"`
			}
		},
		//页面卸载 记录观看秒数
		onUnload: function(e) {  
			// 页面卸载时执行的操作  
			console.log('页面卸载,查询浏览记录是否存在，存在则更新，不存在则添加');  
			this.VideosRecord()
			 
		},
		onLoad(event) {
			//获取真实id，通常 id 来自上一个页面
			if (event.id) {
				this.id = event.id
			}
			
			//若上一页传递了标题过来，则设置导航栏标题
			if (event.title) {
				this.title = event.title
				uni.setNavigationBarTitle({
					title: event.title
				})
			}
			this.getVideoInfo()
			this.videoOff()
			//查询推送的记录
			this.queryPushRecord()
		},
		onReady() {
			// 开始加载数据，修改 where 条件后才开始去加载 clinetDB 的数据 ，需要等组件渲染完毕后才开始执行 loadData，所以不能再 onLoad 中执行
			if (this.id) { // ID 不为空，则发起查询
				// this.$refs.detail.loadData()
			} else {
				return 
				uni.showToast({
					icon: 'none',
					title: this.$t('listDetail.newsErr')
				})
			}
		},
		onNavigationBarButtonTap(event) {
			if (event.type == 'share') {
				this.shareClick();
			}
		},
		methods: {
			//查询推送的记录
			queryPushRecord(){
				const userinfo = uniCloud.getCurrentUserInfo()
				if(userinfo.uid){
					db_Push_records.where({user_id:userinfo.uid,video_id:this.id})
					.get().then( (result)=>{
						  this.pushRecord = result.result.data[0]
					});
				}
				
			},
			//是否显示视频 
			videoOff(){
				uni.request({
					url:"https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/banner/videoOff"
				}).then(res=>{
					this.videobool = res.data
					this.quan = 1
				})
			},
			async VideosRecord(){
				if(this.currentTime == 0){
					return 
				}
				if(this.duration == 0){
					return 
				}
				//获取视频总时长
				//查看用户是否登录 登录则保存
				const userinfo = uniCloud.getCurrentUserInfo()
				 
				if(userinfo.uid){
					
					const uid = userinfo.uid
					let percentage = Math.round(this.currentTime/this.duration*100)+'%';
					let percentage1 = Math.round(this.currentTime/this.duration*100);
					
					
					console.log("查询观看记录");
					const record = await videorecord.where({user_id:uid,videos_id:this.id}).get()
					console.log("查询观看记录",record);
					let data = record.result.data
					if(data != ''){
						if(data[0].count != data[0].number ){
							 
							videorecord.doc(data[0]._id).update({
								number:this.currentTime,
								percentage:percentage,
								percentage1:percentage1,
								count:this.duration,
								})
						}
						 
					}else{
						//存储用户观看记录
						let adds = {
							user_id:uid,
							videos_id:this.id,
							number:this.currentTime,
							percentage:percentage,
							percentage1:percentage1,
							count:this.duration
						}
						videorecord.add(adds).then(e=>{
							console.log(e);
						}).catch(err => {
							console.log(err);
						})
					}
					if(this.pushRecord&&this.pushRecord._id){
						if(this.pushRecord.watch_state==undefined 
						||this.pushRecord.watch_state==0){
							//更新个观看记录为已经观看
							db_Push_records.doc(this.pushRecord._id).update({
								"watch_state" : 1
							})
						}
					}
				}
			},
			handleTimeUpdate(e){
				let duration = e.detail.duration
				let currentTime =  e.detail.currentTime
				this.currentTime = currentTime; 	
				this.duration = duration; 	
			},
			
			//根据id进行请求获取视频信息
			getVideoInfo() {  
				console.log('id是:',this.id)
				uni.request({
					url:`https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/push/getVideoById`,
					method:'POST',
					data:{
						id:this.id
					},
					success: (res) => {
						this.getStrtTime()
						this.viedoSrc = res.data.data[0].videofile.url
						this.videoInfo = res.data.data[0]
						this.pList = this.videoInfo.desc.split('/').map(item => `<p>${item}</p>`).join('')
						
					}
					
				})
				
				 
			},
			//获取用户当前观看时间  未观看则0秒
			async getStrtTime(){
				//查看用户是否登录 登录则保存
				const userinfo = uniCloud.getCurrentUserInfo()
				if(userinfo.uid){
					const uid = userinfo.uid
					let data = ''
					const record = await videorecord.where({user_id:uid,videos_id:this.id}).get().then( (result)=>{
						  data = result.result.data
					});
					if(data != ''){
					   this.videoContext = uni.createVideoContext('myVideo', this);
					   this.videoContext.seek(data[0].number); // 设置为从第10秒开始播放
					} 
				}
			},
			// 视频播放事件
			videoPlay() {  
			    console.log('视频开始播放');  
			},  
			videoPause() {  
				console.log('视频暂停播放');  
			},  
			videoEnded() {  
				console.log('视频播放完毕');  
			},
			
			
			$log(...args){
				console.log('args',...args,this.id)
			},
			setReadNewsLog(){
				let item = {
					"article_id":this.id,
					"last_time":Date.now()
				},
				readNewsLog = uni.getStorageSync('readNewsLog')||[],
				index = -1;
				readNewsLog.forEach(({article_id},i)=>{
					if(article_id == item.article_id){
						index = i
					}
				})
				if(index === -1){
					readNewsLog.push(item)
				}else{
					readNewsLog.splice(index,1,item)
				}
				uni.setStorageSync('readNewsLog',readNewsLog)
				console.log(readNewsLog);
			},
			setFavorite() {
				if ( uniCloud.getCurrentUserInfo().tokenExpired < Date.now() ){
					return console.log('未登录用户');
				}
				let article_id = this.id,
					last_time = Date.now();
					console.log({article_id,last_time});
					readNewsLog.where(`"article_id" == "${article_id}" && "user_id"==$env.uid`)
						.update({last_time})
						.then(({result:{updated}}) => {
							console.log('updated',updated);
							if (!updated) {
								readNewsLog.add({article_id}).then(e=>{
									console.log(e);
								}).catch(err => {
									console.log(err);
								})
							}
						}).catch(err => {
							console.log(err);
						})
			},
			loadData(data) {
				//如果上一页未传递标题过来（如搜索直达详情），则从新闻详情中读取标题
				if (this.title == '' && data[0].title) {
					this.title = data[0].title
					uni.setNavigationBarTitle({
						title: data[0].title
					});

				}
				this.setReadNewsLog();
			},
			/**
			 * followClick
			 * 点击关注
			 */
			followClick() {
				uni.showToast({
					title:this.$t('listDetail.follow'),
					icon: 'none'
				});
			},
			/**
			 * 分享该文章
			 */
			// #ifdef APP
			shareClick() {
				let {
					_id,
					title,
					excerpt,
					avatar
				} = this.$refs.detail.dataList
				console.log( JSON.stringify({
					_id,
					title,
					excerpt,
					avatar
				}) );
				uniShare.show({
					content: { //公共的分享类型（type）、链接（herf）、标题（title）、summary（描述）、imageUrl（缩略图）
						type: 0,
						href: this.uniStarterConfig.h5.url + `/#/pages/list/detail?id=${_id}&title=${title}`,
						title: this.title,
						summary: excerpt,
						imageUrl: avatar + '?x-oss-process=image/resize,m_fill,h_100,w_100' //压缩图片解决，在ios端分享图过大导致的图片失效问题
					},
					menus: [{
							"img": "/static/app-plus/sharemenu/wechatfriend.png",
							"text": this.$t('common.wechatFriends'),
							"share": {
								"provider": "weixin",
								"scene": "WXSceneSession"
							}
						},
						{
							"img": "/static/app-plus/sharemenu/wechatmoments.png",
							"text": this.$t('common.wechatBbs'),
							"share": {
								"provider": "weixin",
								"scene": "WXSceneTimeline"
							}
						},
						{
							"img": "/static/app-plus/sharemenu/mp_weixin.png",
							"text": this.$t('common.wechatApplet'),
							"share": {
								provider: "weixin",
								scene: "WXSceneSession",
								type: 5,
								miniProgram: {
									id: this.uniStarterConfig.mp.weixin.id,
									path: `/pages/list/detail?id=${_id}&title=${title}`,
									webUrl: this.uniStarterConfig.h5.url +
										`/#/pages/list/detail?id=${_id}&title=${title}`,
									type: 0
								},
							}
						},
						{
							"img": "/static/app-plus/sharemenu/weibo.png",
							"text": this.$t('common.weibo'),
							"share": {
								"provider": "sinaweibo"
							}
						},
						{
							"img": "/static/app-plus/sharemenu/qq.png",
							"text": "QQ",
							"share": {
								"provider": "qq"
							}
						},
						{
							"img": "/static/app-plus/sharemenu/copyurl.png",
							"text": this.$t('common.copy'),
							"share": "copyurl"
						},
						{
							"img": "/static/app-plus/sharemenu/more.png",
							"text": this.$t('common.more'),
							"share": "shareSystem"
						}
					],
					cancelText: this.$t('common.cancelShare'),
				}, e => { //callback
					console.log(e);
				})
			}
			// #endif
		}
	}
</script>

<style scoped>
	p {
	  margin-bottom: 16px; /* 调整段落间距 */
	}
	.article-title {
		padding: 20px 15px;
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 10px;
	}
	.video{
		margin-top: 50rpx;
		margin: 0 15px;
	}
	.header-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		font-size: 14px;
	}

	/* 标题 */
	.uni-title {
		display: flex;
		margin-bottom: 5px;
		font-size: 14px;
		font-weight: bold;
		color: #3b4144;
	}

	/* 描述 额外文本 */
	.uni-note {
		color: #999;
		font-size: 12px;

		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
	}

	.footer {
		display: flex;
		align-items: center;
	}

	.footer-button {
		display: flex;
		align-items: center;
		font-size: 12px;
		height: 30px;
		color: #fff;
		background-color: #ff5a5f;
	}

	.banner {
		position: relative;
		margin: 0 15px;
		height: 180px;
		overflow: hidden;
	}

	.banner-img {
		position: absolute;
		width: 100%;
	}

	.banner-title {
		display: flex;
		align-items: center;
		position: absolute;
		padding: 0 15px;
		width: 100%;
		bottom: 0;
		height: 30px;
		font-size: 14px;
		color: #fff;
		background: rgba(0, 0, 0, 0.4);
		overflow: hidden;
		box-sizing: border-box;
	}

	.uni-ellipsis {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.article-title {
		padding: 20px 15px;
		padding-bottom: 0;
	}

	.article-content {
		padding: 15px;
		font-size: 15px;
		letter-spacing: 3px;
		overflow: hidden;
		background-color: #f2f2f2;
		line-height: 30px;
	}
</style>
