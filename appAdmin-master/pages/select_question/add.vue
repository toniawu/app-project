<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="content" label="题目内容" required label-width="100">
        <uni-easyinput placeholder="题目内容" v-model="formData.content" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="answer_type" label="题目类型" required  label-width="100">
        <uni-data-checkbox v-model="formData.answer_type" :localdata="formOptions.answer_type_localdata"></uni-data-checkbox>
      </uni-forms-item>
	  
      <uni-forms-item v-for="(option,index) in formData.select_options" name="select_options" :label="`选项${index+1}`" required >
		  <tr>
			  <td  width="400px">
				  <uni-data-select 
				       v-model="option.selection_id"
				       :localdata="selections"
				       @change="change"
				     ></uni-data-select>
			  </td>
				<td v-if="index>0">
					<button type="warn" class="uni-button" style="width: 80px;" @click="delSelection(index)">删除</button>
				</td>
			  	
		  </tr>
		   
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="addSelection">添加选项</button>
        <button type="primary" class="uni-button" style="width: 100px;margin-left: 15px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/select_question.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'select_question';
  const dbSelectionsName = 'selections';

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
        "content": "",
        "answer_type": null,
        "select_options": [
			{
				"selection_id":"0"
			}
		]
      }
      return {
        formData,
		selections:[],
        formOptions: {
          "answer_type_localdata": [
            {
              "text": "单选",
              "value": 1
            },
            {
              "text": "多选",
              "value": 2
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
	onLoad() {
		 // 获取选项
		db.collection(dbSelectionsName).limit(1000).get()
		.then((res) => {
		  const data = res.result.data
		  if (data) {
			  
			  data.forEach((element, index) =>{
				  this.selections.push(
				  {
					  "value":element._id,
					  "text" :element.content
				  }
				  )
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
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
		delSelection(index){
			this.formData.select_options.splice(index,1)
		},
		addSelection(){
			this.formData.select_options.push(
				{
					"selection_id":"0"
				}
			)
		},
      change(e){
	  },
	  //校验选项
	  checkOptions(){
		  let check = true;
		  
		  if(this.formData.select_options.length<1){
		  			uni.showModal({
		  			  content: '未添加选项',
		  			  showCancel: false
		  			})
		  			check =  false
		  			return
		  }
		  let qIds = []
		  this.formData.select_options.forEach((x)=>{			  
		  			  if(x.selection_id == null ||x.selection_id == "" || x.selection_id == "0"){
		  				  uni.showModal({
		  					content: '未选择选项',
		  					showCancel: false
		  				  })
		  				  check =  false
		  				  return
		  			  }
		  			  if(qIds.includes(x.selection_id)){
		  				  uni.showModal({
		  					content: '选项重复',
		  					showCancel: false
		  				  })
		  				  check =  false
		  				  return
		  			  }
		  			  qIds.push(x.selection_id)
		  })
		  
		  return check;
	  },
      /**
       * 验证表单并提交
       */
      submit() {
		  if(this.checkOptions()){
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
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).add(this.formData).then((res) => {
          uni.showToast({
            title: '新增成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      }
    }
  }
</script>
