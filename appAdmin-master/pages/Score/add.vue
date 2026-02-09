<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="uid" label="用户ID" required>
        <uni-easyinput v-model="formData.uid"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="nickname" label="用户昵称" required>
        <uni-easyinput v-model="formData.nickname"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="score" label="分数" required>
        <uni-easyinput type="number" v-model="formData.score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="scoreList" label="分数记录">
        <uni-data-checkbox :multiple="true" v-model="formData.scoreList"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="answerList" label="答题记录">
        <uni-data-checkbox :multiple="true" v-model="formData.answerList"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="surveysId" label="问卷ID" required>
        <uni-easyinput v-model="formData.surveysId"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="anserTime" label="答题时间" required>
        <uni-datetime-picker return-type="timestamp" v-model="formData.anserTime"></uni-datetime-picker>
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
  import { validator } from '../../js_sdk/validator/Score.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'Score';

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
        "uid": "",
        "nickname": "",
        "score": null,
        "scoreList": [],
        "answerList": [],
        "surveysId": "",
        "anserTime": null
      }
      return {
        formData,
        formOptions: {},
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
