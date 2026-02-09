<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="surveys_id" label="问卷ID">
        <uni-easyinput v-model="formData.surveys_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="question_id" label="所属问题ID">
        <uni-easyinput v-model="formData.question_id"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="num" label="选项编号" required>
        <uni-easyinput type="number" v-model="formData.num"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="serial" label="选项" required>
        <uni-easyinput v-model="formData.serial"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="content" label="选项内容" required>
        <uni-easyinput v-model="formData.content"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="state" label="选项状态" required>
        <uni-data-checkbox v-model="formData.state" :localdata="formOptions.state_localdata"></uni-data-checkbox>
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
  import { validator } from '../../js_sdk/validator/Options5.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'Options5';

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
        "surveys_id": "",
        "question_id": "",
        "num": null,
        "serial": "",
        "content": "",
        "state": null
      }
      return {
        formData,
        formOptions: {
          "state_localdata": [
            {
              "value": 0,
              "text": 0
            },
            {
              "value": 1,
              "text": 1
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
