<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="num" label="推送次数">
        <uni-easyinput type="number" v-model="formData.num"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="users" label="推送用户">
        <uni-data-checkbox :multiple="true" v-model="formData.users"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="video_id" label="视频ID">
        <uni-easyinput v-model="formData.video_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="push_time" label="推送时间">
        <uni-datetime-picker return-type="timestamp" v-model="formData.push_time"></uni-datetime-picker>
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
  import { validator } from '../../js_sdk/validator/Push_records.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'Push_records';

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
        "num": 0,
        "users": [],
        "video_id": "",
        "push_time": null
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
