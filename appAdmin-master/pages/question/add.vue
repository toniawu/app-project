<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="survey_id" label="所属问卷ID">
        <uni-easyinput v-model="formData.survey_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="title" label="问题标题" required>
        <uni-easyinput v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="type" label="问题类型" required>
        <uni-data-checkbox v-model="formData.type" :localdata="formOptions.type_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="surName" label="关联问卷表" required>
        <uni-data-picker v-model="formData.surName" collection="Surveys" field="_id as value, title as text"></uni-data-picker>
      </uni-forms-item>
	  
      <uni-forms-item  name="contents"  required v-for="(content,idx) in formData.contents" label="选项{{idx}}">
        <uni-data-picker  v-if="formData.type== 'SINGLE' || formData.type== 'MULTY'" v-model="content.option" collection="Options" field="_id as value, content as text"></uni-data-picker>
        <uni-data-picker  v-if="formData.type== 'TEXT'" v-model="content.option" collection="Options" field="_id as value, content as text"></uni-data-picker>
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
  import { validator } from '../../js_sdk/validator/Questions.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'Questions';

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
        "survey_id": "",
        "title": "",
        "type": "",
        "surName": "",
        "contents": []
        // "options2": "",
        // "options3": "",
        // "options4": "",
        // "options5": ""
      }
      return {
        formData,
        formOptions: {
          "type_localdata": [
            {
              "text": "单选",
              "value": "SINGLE"
            },
			{
              "text": "填空",
              "value": "TEXT"
            },
            {
              "text": "多选",
              "value": "MULTY"
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      
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
