<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="serial" label="序号" required>
        <uni-easyinput type="number" v-model="formData.serial"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="surveyNum" label="问卷序号">
        <uni-easyinput type="number" v-model="formData.surveyNum"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="survey_id" label="关联问卷" required>
        <uni-data-picker v-model="formData.survey_id" collection="Surveys" field="_id as value, title as text"></uni-data-picker>
      </uni-forms-item>
      <uni-forms-item name="videoNum" label="视频序号" required>
        <uni-easyinput type="number" v-model="formData.videoNum"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="video_id" label="关联视频" required>
        <uni-data-picker v-model="formData.video_id" collection="Videos" field="_id as value, title as text"></uni-data-picker>
      </uni-forms-item>
      
        <uni-forms-item name="questions" label="关联问题">
			<uni-data-checkbox :multiple="true" max="10" v-model="formData.questions" :localdata="range" @change="change"></uni-data-checkbox>
      </uni-forms-item>
	  
      <uni-forms-item name="pushDate" label="推送日期" required>
        <uni-datetime-picker return-type="timestamp" v-model="formData.pushDate"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="min_score" label="最低分数">
        <uni-easyinput type="number" v-model="formData.min_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="max_score" label="最高分数">
        <uni-easyinput type="number" v-model="formData.max_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="pushWeek" label="答题后第N周" required>
        <uni-data-checkbox v-model="formData.pushWeek" :localdata="formOptions.pushWeek_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../js_sdk/validator/Push_rules.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'Push_rules';

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
        "serial": null,
        "surveyNum": null,
        "survey_id": "",
        "videoNum": null,
        "video_id": "",
        "questions": [],
        "pushDate": null,
        "min_score": null,
        "max_score": null,
        "pushWeek": null
      }
      return {
        formData,
        formOptions: {
          "pushWeek_localdata": [
            {
              "value": 1,
              "text": 1
            },
            {
              "value": 2,
              "text": 2
            },
            {
              "value": 3,
              "text": 3
            },
            {
              "value": 4,
              "text": 4
            },
			{
			  "value": 5,
			  "text": 5
			},
			{
			  "value": 6,
			  "text": 6
			},
			{
			  "value": 7,
			  "text": 7
			},
			{
			  "value": 8,
			  "text": 8
			},
			{
			  "value": 9,
			  "text": 9
			},
			{
			  "value": 10,
			  "text": 10
			},
			{
			  "value":11,
			  "text": 11
			},
            {
              "value": 12,
              "text": 12
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        },
		range: [],
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
	  this.getQuestions();
    },
    methods: {
		//问题多选框
		change(e){
			console.log('e:',e);
		},
		//查询问题表
		async getQuestions(){
			const res = await db.collection('Questions').get();
			console.log('res:',res.result.data);
			this.range = res.result.data.map(item=>{
				return {
					value: item._id,
					text: item.title,
				}
			})
		},
      
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).add(value).then((res) => {
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
