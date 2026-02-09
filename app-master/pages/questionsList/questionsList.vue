<template>
	<view class="container">
		<!-- 问卷列表 -->
		<view v-show="questionsList.length>0" class="questionList">
			<view  class="questionItem" v-for="item in questionsList" @click="goDetail(item)">
				<view class="questionTitle">{{item.title}}</view>
				<view class="questionContent">{{item.description}}</view>
			</view>
		</view>
		<view v-show="questionsList.length==0">
			暂无可答问卷
		</view>
	</view>
</template>

<script>
	const db = uniCloud.database();
	const ScoreColl = db.collection('Score')
	const questionnaireObj = uniCloud.importObject('questionnaire') 
	export default {
		data() {
			return {
				bool:1,
				questionsList:[
				]
				
			};
		},
		onLoad(){
			this.getQuestionsList()
		},
		methods: {
			//跳转到问卷详情
			goDetail(content){
				let c = JSON.stringify(content)
				uni.navigateTo({
					url: `/pages/questionsList/questionsDetail/questionsDetail?content=`
					+ encodeURIComponent(c)
				});
			},
			isOneMonthPassed(timestamp) {  
			  // 将时间戳转换为Date对象  
			  const targetDate = new Date(timestamp);  
			  
			  // 获取当前时间  
			  const now = new Date();  
			  
			  // 获取当前时间的年和月  
			  const nowYear = now.getFullYear();  
			  const nowMonth = now.getMonth() + 1; // getMonth() 返回的是0-11，所以需要+1  
			  
			  // 获取目标时间的年和月  
			  const targetYear = targetDate.getFullYear();  
			  const targetMonth = targetDate.getMonth() + 1;  
			  
			  // 如果年份不同，则直接判断为超过一个月  
			  if (targetYear !== nowYear) {  
			    return true;  
			  }  
			  
			  // 如果年份相同，比较月份  
			  if (targetMonth < nowMonth) {  
			    return true;  
			  }  
			  
			  // 如果月份也相同，则需要进一步判断日期（注意：这里直接返回false，因为只要求满一个月）  
			  // 如果需要精确到日期，可以添加额外的逻辑来比较日期  
			  // 例如：如果targetMonth === nowMonth && targetDate.getDate() < now.getDate()，但这通常不是判断“是否满一个月”的必要条件  
			  
			  // 默认情况下，如果没有达到上述条件，则认为没有满一个月  
			  return false;  
			} ,
			//获取问卷列表
			getQuestionsList(){
				uni.showLoading({
					title: '加载中'
				});
				setTimeout(()=>{
					uni.hideLoading();
				},1000)
	
				let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
				let userId = userInfo._id
				//获取用户答卷时间，与当前时间比较，间隔大于1个月 则显示问卷，小于1个月 则隐藏问卷
				questionnaireObj
				.getLatestAnswerTime(userId)
				.then((res1)=>{
					console.log(res1);
						var lastetTime = res1.data
						let bool = this.isOneMonthPassed(lastetTime)
						if(bool){
							 //请求接口获取数据
							 //获取用户是否填写问卷编号
							let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
							let userId = userInfo._id
							uni.request({
								url:"https://fc-mp-f02adfe0-c2b7-4979-95b9-97f95913e417.next.bspapp.com/banner/getWenId",
								method: 'POST',
								data:{'uid':userId},
								success: (res) => {
									console.log("用户id ", res);
									const resData = res.data.data;
									
									
									questionnaireObj.getQuestionnaireInfoByNum(resData)
									.then((res1)=>{
										this.questionsList = res1.data
										console.log(this.questionsList)
									}).catch(err => {
										console.log(err);
									})
								},
							})
						
						}
				}).catch(err => {
					console.log(err);
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
page {
	background-color: #ffff; /* 页面背景色为灰色 */
}
.container{
	padding: 40rpx;
	.questionList{
		.questionItem{
			background-color: #d8bfd8;
			margin-bottom: 20rpx;
			padding: 20rpx;
			border-radius: 10rpx;
			box-shadow: 0 2rpx 5rpx 0 rgba(0,0,0,0.1);
			border: #333;
			.questionTitle{
				font-size: 32rpx;
				color: #333;
				margin-bottom: 20rpx;
			}
			.questionContent{
				font-size: 28rpx;
				color: #666;
			}
		}
	}
}
</style>
