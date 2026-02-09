// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database()
// 问卷数据库
const db_questionnaire = "questionnaire";
//选择题数据库
const db_select = "select_question";
//填空题数据库
const db_fill = "fill_blank";
//选项数据库
const db_selections = "selections";
// 答卷数据库
const db_question_answer = "question_answer";

module.exports = {
	_before: function () { // 通用预处理器
		// this.params = this.getParams() // 获取请求参数
	},
	
	/* 获取最新的问卷的答题时间
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */	
	async getLatestAnswerTime(user_id) {
		let res = await  db.collection(db_question_answer)
		.field({_creatTime:true})
		.where({user_id:user_id}).get();
		if(res.data != ''){
			//获取问卷
			let answer = res.data[0]
			return  {
					code: 200,
					msg: '查询成功',
					data: answer._creatTime
				}
		}
		return  {
				code: 200,
				msg: '查询成功',
				data: 0
			}
	},
	/**
	 * answer_type 选择题 1 单选 2 多选
	 * question_type 0 选择题 1 填空题
	 * question_num_type 0 英文字母显示选项 1 数字显示选项
	 * 答案：都用数组传 单选题传选项的索引 比如我选了C 那么传 [3]
	 * 如果是多选题的 我选了 A B D 那么传 [1,2,4]
	 * 如果是填空题 我填了 ‘仗剑走天涯’ 那么传 ['仗剑走天涯']
	 * 参数格式
	 * 
	 {
		 "_id": "676a1904bd0220e817be0c1f",
		     "num": 20,
		     "title": "测试删除问题",
		     "description": "测试删除问题",
		     "category_id": "66965adae0ec199b18e23efb",
			 "score":50,
	 questions:[
		{
        "question_id": "67695962466d41729b9ed720",
        "question_type": 0,
        "question_num_type": 0,
        "content": "测试第二个问题",
		"score":5,
        "select_options": [
            {
                "_id": "6769239b1c90b6b5563ee292",
                "content": "测试加两个选项",
                "state": 1
            },
            {
                "_id": "6769239b1c90b6b5563ee292",
                "content": "测试加两个选项",
                "state": 1
            },
            {
                "_id": "6769239b1c90b6b5563ee292",
                "content": "测试加两个选项",
                "state": 1
            },
            {
                "_id": "6769238221821bf1c7846fd5",
                "content": "测试加一个选项",
                "state": 0
            }
        ],
        "answer_type": 1,		
		"answer":[1]
    },
    {
        "question_id": "67692b35a09a9be4be078b32",
        "question_type": 1,
        "question_num_type": 0,
        "content": "测试第一个填空题",
        "answer_type": 0,
		"answer":['这是我的填空题的答案']
    }
	]
}
	 * 提交问卷
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */	
	async answerQuestionnaire(answer) {
		
		// let answer = JSON.parse(this.getHttpInfo().body)
		// 设置问卷id
		answer.questionnaire_id = answer._id;
		delete answer._id
		delete answer._creatTime
		// 计算分数		
		// 多选题就是几个选项就是多少分，如果全选就是满分；
		// 剩下的就是非常同意算满分，然后依次递减一分。每个选项最低分也是1分		
		let score = 0;//总分
		let errMsg = ''
		answer.questions.forEach((x)=>{
			if(x.answer.length==0){				
				errMsg= '有题未作答'
			}
			//本道题的分数
			let q_score = 0;
			// 只有选择题才计分
			if(x.question_type==0){				
				//判断是单选还是多选 1 单选 2 多选
				if(x.answer_type==1){
					q_score = x.answer[0]
				}else if(x.answer_type==2){
					q_score = x.answer.length
				}else{
					errMsg= '选择题类型有误'
				}
			}
			x.score = q_score;
			score = score+q_score;
		})
		if(errMsg.length>0){
			return {
				code: -1,
				msg: errMsg
			}
		}
		answer['score'] = score
		const dbJQL = uniCloud.databaseForJQL({
			clientInfo:this.getClientInfo()
		})
		const res = await dbJQL.collection(db_question_answer)
		.add(answer)		
		//成功返回成功信息,失败返回失败信息
		if(res.id){
			return {
				code: 200,
				msg: '提交成功',
				data: score
			}
		}else{
			return {
				code: -1,
				msg: '提交失败'
			}
		}
	},
	/**
	 * 根据序号获取问卷详细内容
	 * @param {string} param1 参数1描述
	 * @returns {object} 返回值描述
	 */	
	async getQuestionnaireInfoByNum(questionnaireNum) {
		// 参数校验，如无参数则不需要
		if (!questionnaireNum) {
			return {
				errCode: -1,
				errMsg: '参数不能为空'
			}
		}
		// 业务逻辑
		let res = await  db.collection(db_questionnaire).where({num:Number.parseInt(questionnaireNum)}).get();
		if(res.data != ''){
			//获取问卷
			let questionnaire = res.data[0]
			//问卷的问题
			let questions = questionnaire.questions
			//所有的选择题id
			let selectQuestionIds = []
			//所有的填空题id
			let fillQuestionIds = []
			
			let allQuestions = []
			
			questions.map(x=>{
				if(x.question_type==0){
					selectQuestionIds.push(x.question_id)
				}
				if(x.question_type==1){
					fillQuestionIds.push(x.question_id)
				}
			})
			//所有的选择题
			let selectQuestions = [];
			if(selectQuestionIds.length >0){
				res = await  db.collection(db_select).where({_id:db.command.in(selectQuestionIds)}).limit(1000).get();				
				selectQuestions = res.data
				//选项id
				let optionIds = []
				selectQuestions.map(a=>{
					a.select_options.map(b=>{
						optionIds.push(b.selection_id)
					})
				})
				//查询选项
				res = await  db.collection(db_selections).where({_id:db.command.in(optionIds)}).limit(1000).get();	
				let options = res.data
				selectQuestions.forEach((a)=>{
					let ops = []
					a.select_options.map(b=>{						
						options.map(c=>{
							if(c._id==b.selection_id){
								ops.push(c)
							}
						})
					})
					//复制一份选项 避免影响别的
					a.select_options = JSON.parse(JSON.stringify(ops))					
					//判断是单选还是多选 1 单选 2 多选
					if(a.answer_type==1){
						let only = false
						a.select_options.forEach((x)=>{
							if(only){
								x.state = 0
							}
							if(!only&&x.state==1){
								only = true
							}
						})
					}
					
					allQuestions.push(a)
				})
			}
			
			
			let fillQuestions = []
			if(fillQuestionIds.length >0){
				res = await  db.collection(db_fill).where({_id:db.command.in(fillQuestionIds)}).get();
				//所有的填空题
				fillQuestions = res.data
				fillQuestions.forEach((a)=>{
					allQuestions.push(a)
				})
			}
			questions.map(x=>{
				allQuestions.map(a=>{
					if(x.question_id == a._id){
						x.content = a.content
						if(x.question_type==0){
							x.select_options = a.select_options
						}						
						x.answer_type = a.answer_type
					}
				})
			})
			
			//所有的选项
			let result = {
				errcode: 200,
				errmsg: '查询成功',
				data:  [questionnaire]
			}
			return result
		} else{
			return {
				errCode: -1,
				errMsg: '问卷不存在'
			}
		}		
	}
	
}
