<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="num" label="序号" required label-width="100">
        <uni-easyinput type="number" v-model="formData.num"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="title" label="问卷标题" required label-width="100">
        <uni-easyinput v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="description" label-width="100" label="问卷描述" required>
        <uni-easyinput v-model="formData.description"></uni-easyinput>
      </uni-forms-item>
	  <uni-forms-item name="next_num" label="下一个问卷序号">
	    <uni-easyinput type="number" v-model="formData.next_num"></uni-easyinput>
	  </uni-forms-item>
	  <uni-forms-item name="next_interval_day" label="下一个问卷触发间隔天数">
	    <uni-easyinput type="number" v-model="formData.next_interval_day"></uni-easyinput>
	  </uni-forms-item>
      <uni-forms-item name="category_id" label-width="100" label="分类编号" required>
       <uni-data-picker v-model="formData.category_id"
       	collection="Category" field="_id as value, title as text">
       </uni-data-picker>
      </uni-forms-item>
	 <uni-forms-item v-for="(option,index) in formData.questions"
	 name="select_options" :label="`题目${index+1}`" required >
	 			<tr>
	 			  <td  style="width:400px">
	 						<uni-data-select
	 						v-model="option.question_id"
	 						:localdata="questions"
	 						@change="changeQuestion(option)"
	 					  ></uni-data-select>  
	 				  </td>
	 				  <td v-if="index>0">
	 						<button type="warn" class="uni-button" style="width: 80px;" @click="delSelection(index)">删除</button>
	 				  </td>
	 			</tr>
	 				  <tr v-if="option.question_type==0" >
	 						<div style="display: flex;align-items: center;width: 200px;">
	 							 <label>选项显示格式：</label>
	 							 <uni-data-select style="width: 100px;"
	 										v-model="option.question_num_type"
	 										:localdata="question_num_types"
	 							 ></uni-data-select>
	 						</div>
	 				  </tr>
	 				  
	 </uni-forms-item>
      <view class="uni-button-group">
		  <button type="primary" class="uni-button" style="width: 100px;margin-left: 15px;" @click="addQuestion">添加问题</button>
		  
        <button type="primary" class="uni-button" style="width: 100px;margin-left: 15px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/questionnaire.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'questionnaire';
 //选择题表
  const dbSelectQuestionName = 'select_question';
  //填空题表
  const dbFillQuestionName = 'fill_blank';
  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key]
      }
    }
    return result
  }

  

  export default {
    data() {
      let formData = {
        "num": null,
        "title": "",
        "description": "",
        "category_id": "",
		"next_interval_day":"",
		"next_num":"",
        "questions": []
      }
      return {
		  question_num_types:[
		      {
		        "value": 0,
		        "text": "英文字母"
		      },
		      {
		        "value": 1,
		        "text": "数字"
		      }
		    ],
		    question_types:[
		      {
		        "value": 0,
		        "text": "选择"
		      },
		      {
		        "value": 1,
		        "text": "填空"
		      }
		    ],
		  questions:[],
        formData,
        formOptions: {},
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
		  this.getQuestions();
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
		checkQ(){
			let check = true;
		  //校验问题对象
		  if(this.formData.questions.length<1){
			uni.showModal({
			  content: '未添加问题',
			  showCancel: false
			})
			check =  false
			return
		  }
		  let qIds = []
		  this.formData.questions.forEach((x)=>{			  
			  if(x.question_id == null ||x.question_id == "" ){
				  uni.showModal({
					content: '未选择问题',
					showCancel: false
				  })
				  check =  false
				  return
			  }
			  if(qIds.includes(x.question_id)){
				  uni.showModal({
					content: '选择问题重复',
					showCancel: false
				  })
				  check =  false
				  return
			  }
			  qIds.push(x.question_id)
		  })
		  
		  return check;
		},
		delSelection(index){
			this.formData.questions.splice(index,1)
		},
		changeQuestion(option){
			if(option){
				let question_id = option.question_id
				for (var i = 0; i < this.questions.length; i++) {
					var q = this.questions[i]
					if(q.value ==question_id ){
						option.question_type = q.question_type
					}
				}
			}
		},
		addQuestion(){
			this.formData.questions.push(
				{
					"question_id":"",
					"question_type":1,
					"question_num_type":0
				}
			)
		},
      getQuestions(){
      	// 获取选择题
      	db.collection(dbSelectQuestionName).limit(1000).get()
      	.then((res) => {
      	  const data = res.result.data
      	  if (data) {
      		  
      		  data.forEach((element, index) =>{
      			  this.questions.push(
      			  {
      				  "value":element._id,
      				  "text" :element.content,
					  "question_type": 0
      			  }
      			  )
      		  });
      		  
      		  //查询填空题
      		  db.collection(dbFillQuestionName).limit(1000).get()
      		  .then((res) => {
      			  const data1 = res.result.data
      			  if (data1) {					  				  
      					  data1.forEach((element, index) =>{
      						  this.questions.push(
      						  {
      							  "value":element._id,
      							  "text" :element.content,
								  "question_type": 1
      						  }
      						  )
      					  });
      				 }
      		  })
      		  
      	  }
      	}).catch((err) => {
      	  uni.showModal({
      	    content: err.message || '请求服务失败',
      	    showCancel: false
      	  })
      	}).finally(() => {
      	  uni.hideLoading()
      	})
      },
      /**
       * 验证表单并提交
       */
      submit() {
		  if(this.checkQ()){
			  uni.showLoading({
			    mask: true
			  })
			  this.$refs.form.validate().then((res) => {
			    return this.submitForm(res)
			  }).catch(() => {
			  }).finally(() => {
			    uni.hideLoading()
			  })
		  }
      },

      /**
       * 提交表单
       */
      submitForm(value) {
		  if(this.formData.next_num){
			value.next_num = Number.parseInt(this.formData.next_num)
		  }
		  if(this.formData.next_interval_day){
			value.next_interval_day = Number.parseInt(this.formData.next_interval_day)
		  }
		  value.questions = this.formData.questions
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field("next_num,next_interval_day,num,title,description,category_id,questions").get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data
            
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>
