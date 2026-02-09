<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="name" label-width="100"  label="医院名称" required>
        <uni-easyinput placeholder="医院名称" v-model="formData.name" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="pos_x"  label-width="100" label="医院经度" required>
        <uni-easyinput placeholder="医院经度" v-model="formData.pos_x" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="pos_y"  label-width="100" label="医院纬度" required>
        <uni-easyinput placeholder="医院纬度" v-model="formData.pos_y" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="descInfo"  label-width="100" label="描述信息">
        <uni-easyinput placeholder="描述信息" v-model="formData.descInfo" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="hospitalImg" label="图片文件">
        <uni-file-picker file-mediatype="image" file-extname="jpg,png" return-type="object" v-model="formData.hospitalImg"></uni-file-picker>
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
  import { validator } from '../../js_sdk/validator/hospital_position.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'hospital_position';

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
        "name": "",
        "pos_x": "",
        "pos_y": "",
        "descInfo": "",
        "hospitalImg": null
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
