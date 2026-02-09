<template>
	 <view class="page-main">
			 
	        <liu-clean-time ref="liuCleanTime" @submit="submit"></liu-clean-time>
		 
	    </view>
</template>

<script>
	export default {
		 data() {
				return {
					
					//问卷数据
					dataObj: {
						pkId: '1', //问卷ID
						title: '问卷调查', //问卷标题
						desc: '描述：最新问卷调查', //问卷描述
						number: 23, //问卷总题目数量
						questions: [
							// 多选题
							{
								questionId: '1',
								questionType: 'MULTY',
								title: '这是一个多选题？',
								children: [
								{
									id: '111',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'A', //选项序号
									content: '多选第一个选项' //选项内容
								}, 
								{
									id: '222',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'B', //选项序号
									content: '多选第二个选项' //选项内容
								}, 
								{
									id: '333',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'C', //选项序号
									content: '多选第三个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								]
							},
							{
								questionId: '2',
								questionType: 'MULTY',
								title: '这是一个多选题？',
								children: [
								{
									id: '111',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'A', //选项序号
									content: '多选第一个选项' //选项内容
								}, 
								{
									id: '222',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'B', //选项序号
									content: '多选第二个选项' //选项内容
								}, 
								{
									id: '333',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'C', //选项序号
									content: '多选第三个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								]
							},
							{
								questionId: '3',
								questionType: 'MULTY',
								title: '这是一个多选题？',
								children: [
								{
									id: '111',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'A', //选项序号
									content: '多选第一个选项' //选项内容
								}, 
								{
									id: '222',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'B', //选项序号
									content: '多选第二个选项' //选项内容
								}, 
								{
									id: '333',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'C', //选项序号
									content: '多选第三个选项' //选项内容
								},
								{
									id: '444',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '多选第四个选项' //选项内容
								},
								]
							},
							
							
							// 单选题
							{
								questionId: '4',
								questionType: 'SINGLE',
								title: '这是一个单选题？',
								children: [
								{
									id: 'A',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'A', //选项序号
									content: '单选第一个选项' //选项内容
								}, {
									id: 'B',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'B', //选项序号
									content: '单选第二个选项' //选项内容
								}, {
									id: 'C',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'C', //选项序号
									content: '单选第三个选项' //选项内容
								},
								{
									id: 'D',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '单选第四个选项' //选项内容
								},
								{
								id: 'E',
								state: 0, //是否选中(0未选中；1:已选中)
								serial: 'E', //选项序号
								content: '单选第五个选项' //选项内容
							}],
							},
							{
								questionId: '5',
								questionType: 'SINGLE',
								title: '这是一个单选题？',
								children: [
								{
									id: 'A',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'A', //选项序号
									content: '单选第一个选项' //选项内容
								}, {
									id: 'B',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'B', //选项序号
									content: '单选第二个选项' //选项内容
								}, {
									id: 'C',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'C', //选项序号
									content: '单选第三个选项' //选项内容
								},
								{
									id: 'D',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '单选第四个选项' //选项内容
								},
								{
								id: 'E',
								state: 0, //是否选中(0未选中；1:已选中)
								serial: 'E', //选项序号
								content: '单选第五个选项' //选项内容
							}],
							},
							{
								questionId: '6',
								questionType: 'SINGLE',
								title: '这是一个单选题？',
								children: [
								{
									id: 'A',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'A', //选项序号
									content: '单选第一个选项' //选项内容
								}, {
									id: 'B',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'B', //选项序号
									content: '单选第二个选项' //选项内容
								}, {
									id: 'C',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'C', //选项序号
									content: '单选第三个选项' //选项内容
								},
								{
									id: 'D',
									state: 0, //是否选中(0未选中；1:已选中)
									serial: 'D', //选项序号
									content: '单选第四个选项' //选项内容
								},
								{
								id: 'E',
								state: 0, //是否选中(0未选中；1:已选中)
								serial: 'E', //选项序号
								content: '单选第五个选项' //选项内容
							}],
							},

						]
					},
					serial:
						['A','B','C','D','E','F','G','H','I',
							'J','K','L','M','N','O','P','Q','R',
							'S','T','U','V','W','X','Y',
							'Z','a','b','c','d','e','f','g','h','i',
													'j','k','l','m','n','o','p','q','r',
													's','t','u','v','w','x','y',
													'z']
						
					,
					//后台数据
					dataObj2: {
						pkId: '', //问卷ID
						title: '', //问卷标题
						desc: '', //问卷描述
						number: 23, //问卷总题目数量
						questions:[]
					},
					score : 0
					
					
						
		            }
		        },
		        // mounted() {
		        //     this.$nextTick(res => {
		        //         this.init()
		        //     })
		        // },
				onLoad(options){
					console.log(options);
					// this.dataObj2.pkId = options.id
					// this.dataObj2.title = options.title
					// this.dataObj2.desc = options.desc
					this.dataObj2 = JSON.parse(decodeURIComponent(options.content))
					this.dataObj = JSON.parse(decodeURIComponent(options.content))
					this.dealData()
					// this.getQuestionsDetail()
					// console.log('问卷数据：' + JSON.stringify(this.dataObj2))
				},
		        methods: {
					
					//处理数据结构
					dealData(){
						console.log(this.dataObj2);
						let questions = []
						this.dataObj2.questions.map(res => {
							let questionType = null
							if(res.question_type == 0){
								if(res.answer_type == 1){
									questionType = "SINGLE"
								}else{
									questionType = "MULTY"
								}
							}else{
								questionType = "QUESTION"
							}
							let question_num_type = res.question_num_type
							// answer_type 选择题 1 单选 2 多选
							// * question_type 0 选择题 1 填空题
							// * question_num_type 0 英文字母显示选项 1 数字显示选项
							let obj = {
								questionId: res.question_id,
								questionType: questionType,
								question_type: res.question_type,
								title: res.content,
								children: []
							}
							var idx = 0;
							//将选择题的选项添加到 children中
							if(res.question_type == 0){
								let selectAnswer = ''
								res.select_options.forEach((x)=>{
									var op_serial = null
									if(question_num_type == 0){
										op_serial = this.serial[idx]
									}else if(question_num_type == 1){
										 op_serial = idx+1
									}
									idx = idx+1;
									let option = {
										id: x._id, // id的属性
										state:x.state, //state的属性
										serial: op_serial, 
										content: x.content
									};  				
									if(x.state == 1){
										selectAnswer = selectAnswer+''+op_serial+","
									}
									obj.children.push(option)									
								})
								//初始化答案 因为有默认选中的选择题
								obj.selectAnswer = selectAnswer.substring(0,selectAnswer.length-1)
							}else{
								obj.selectAnswer = ''
							}
							// this.dataObj2.questions.unshift(obj)
							
							
							
							questions.push(obj)
						})
						this.dataObj2.questions = questions
						
						// 输出转换后的数据  
						// console.log('转换后的数据结构:',JSON.stringify(this.dataObj2));
						// console.log('转换后的数据结构:',this.dataObj2.questions.length);
						this.dataObj2.number = this.dataObj2.questions.length
						
						this.init(this.dataObj2)
						
						
					},
					
		            //问卷初始化
		            init(obj) {
		                this.$refs.liuCleanTime.initObj(obj)
		            },
		            //提交回调
		            submit(e) {
						var q = this.dataObj
						var ans = e.userAnswerList
						q.questions.forEach((x)=>{
							ans.forEach((y)=>{
								if(y.questionId == x.question_id){
									// answer_type 选择题 1 单选 2 多选
									// * question_type 0 选择题 1 填空题
									// * question_num_type 0 英文字母显示选项 1 数字显示选项
									if(x.question_type == 0){
										if(x.answer_type == 1){
											//英文
											if(x.question_num_type == 0){
												x.answer = [this.serial.indexOf(y.userAnswer)+1]
											}else{
												x.answer = [Number.parseInt(y.userAnswer)]
											}
										}else{
											//多选
											var anses = y.userAnswer.split(',');
											let answers = []
											if(x.question_num_type == 0	){
												anses.forEach((a)=>{
													answers.push(this.serial.indexOf(a)+1)
												})
											}else{
												anses.forEach((a)=>{
													answers.push(Number.parseInt(a))
												})
											}
											x.answer = answers
										}
									}else{
										x.answer = [y.userAnswer]
									}								
									
								}
							})							
						})
						//第一步导入问卷云对象
						const questionnaire = uniCloud.importObject('questionnaire') 
						//云对象
						const video = uniCloud.importObject('video') 
						//导入云对象后就可以直接调用该对象的方法了，注意使用异步await
						let that = this
						questionnaire.answerQuestionnaire(q) .then((res1)=>{
										that.score = res1.data
										//生成推送视频
										let userInfo = uni.getStorageSync('uni-id-pages-userInfo')
										let userId = userInfo._id
										video.getUserVideoList({userId:userId}).then((res22)=>{
											//展示分数
											uni.showToast({
												title: '问卷得分：' + that.score,
												icon: 'success',
												duration: 2000,
											})
											setTimeout(()=>{
												//去主页
												uni.switchTab({
													url: '/pages/home/home'
												});
											},2000)
										})
										
										
									}).catch(err => {
										console.log(err);
									})
		            }
						
		        }
	}
</script>

<style lang="scss">
	.in{
		width: 100%;
		padding: 10rpx;
	}
	.inp{
		width: 80%;height: 80rpx;margin: 0 auto;border: 1rpx solid black;
		border-radius: 50rpx;
		padding-left: 30rpx;
		color: #e7e7e7;
		
	}
</style>
