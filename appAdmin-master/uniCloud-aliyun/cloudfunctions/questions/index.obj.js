// 问卷调查模块
const db = uniCloud.database()
module.exports = {
	_before: function () { // 通用预处理器
	this.params = this.getParams() // 获取请求参数
	},
	//获取问卷列表
	async getSurveys() {
		let res = await db.collection('Surveys').get()
		let result = {
			errcode: 200,
			errmsg: '查询成功',
			data: res.data
		}
		return result
	},
	//获取选项
	async getOptions() {
		let res = await db.collection('Options5')
		.doc("6653251cc3b5c965020d0cce")
		.get()
		let result = {
			errcode: 200,
			errmsg: '查询成功',
			data: res.data,
		}
		return result
	},
	
	
	//获取问卷详情
	async getSurveysDetail() {
		this.params = JSON.parse(this.getHttpInfo().body)
		// console.log('传参是1:',this.params)
		// let id = "6652aa72c3b5c96502f8af24"
		//查询问题
		let res = await db.collection('Questions')
		.where({
			surName: this.params.id,
		})
		.get()
		
	
		let questions = res.data
		console.log('问题数据是:',questions)
		//处理多条数据内的answerContent
	
		const queryPromises = questions.map(async (question) => {  
		    // 提取当前问题的五个选项ID

		    const optionsId1 = question.options;  
		    const optionsId2 = question.options2 ;  
		    const optionsId3 = question.options3;  
		    const optionsId4 = question.options4; 
			const optionsId5 = question.options5;
		  
		    // 查询五个选项
		     const optionsPromises = [  
		        db.collection('Options').doc(optionsId1).get(),  
		        db.collection('Options2').doc(optionsId2).get(), 
		        db.collection('Options3').doc(optionsId3).get(),  
		        db.collection('Options4').doc(optionsId4).get(),  
				db.collection('Options5').doc(optionsId5).get(),
		    ];  
		  
		    try {  
		        // 等待所有Promise完成  
		        const options = await Promise.all(optionsPromises);  
				console.log('选项数据是:',options)
		  
		        // 更新问题的options字段  
		  //       question.options = options[0].data[0].content ? options[0].data[0].content : null;  
		  //       question.options2 = options[1].data[0].content ? options[1].data[0].content : null;  
		  //       question.options3 = options[2].data[0].content ? options[2].data[0].content : null;  
		  //       question.options4 = options[3].data[0].content ? options[3].data[0].content : null;
				// question.options5 = options[4].data[0].content ? options[4].data[0].content : null;
				
				question.options = options[0].data[0].content ? options[0].data[0] : null;
				question.options2 = options[1].data[0].content ? options[1].data[0] : null;
				question.options3 = options[2].data[0].content ? options[2].data[0] : null;
				question.options4 = options[3].data[0].content ? options[3].data[0] : null;
				question.options5 = options[4].data[0].content ? options[4].data[0] : null;
				
				
				
		        // 返回更新后的问题对象  
		        return questions;  
		  
		    } catch (error) {  
		        // 捕获并处理可能出现的错误  
		        console.error('Error fetching  for question:', question, error);  
		        return question; // 或者返回一个带有错误标记的对象  
		    }  
		});  
		// 等待所有查询完成，并获取更新后的问题数组  
		try {  
		    const updatedQuestions = await Promise.all(queryPromises);  
			// 返回更新后的数组 
			
			
			let result = {
				errcode: 200,
				errmsg: '查询成功',
				data:updatedQuestions ,
			}
			return result
		} catch (error) {  
		    // 处理可能出现的错误  
		    console.error('Error fetching options:', error);  
		    throw error; // 或者返回一个错误处理的数组  
		}  
		
		
		
	},
}
