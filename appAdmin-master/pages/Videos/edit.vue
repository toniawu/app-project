<template>
  <view class="uni-container">
    <uni-forms ref="form" :model="formData" validateTrigger="bind">
      <uni-forms-item name="num" label="视频编号" required>
        <uni-easyinput type="number" v-model="formData.num"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="title" label="视频标题" required>
        <uni-easyinput v-model="formData.title"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="desc" label="视频描述" required>
        <uni-easyinput v-model="formData.desc"></uni-easyinput>
      </uni-forms-item>
	  <uni-forms-item name="category_id" label="分类序号" required>
	    <uni-data-picker v-model="formData.category_id" collection="Category" field="_id as value, title as text"></uni-data-picker>
	  </uni-forms-item>
      <uni-forms-item name="cover" label="封面" required>
        <uni-file-picker file-mediatype="image" return-type="object" v-model="formData.cover"></uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="selected" label="精选">
         <uni-data-checkbox v-model="formData.selected" :localdata="formOptions.selected_localdata"></uni-data-checkbox>
      </uni-forms-item>
      <uni-forms-item name="videofile" label="视频文件" required>
        <uni-file-picker file-mediatype="video" return-type="object" v-model="formData.videofile"></uni-file-picker>
      </uni-forms-item>
      <uni-forms-item name="start_score" label="起始分数">
        <uni-easyinput type="number" v-model="formData.start_score"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="end_score" label="结束分数">
        <uni-easyinput type="number" v-model="formData.end_score"></uni-easyinput>
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
  import { validator } from '../../js_sdk/validator/Videos.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'Videos';

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
        "desc": "",
        "cover": null,
        "selected": null,
        "videofile": null,
        "start_score": null,
        "end_score": null,
        "category_id": ""
      }
      return {
        formData,
        formOptions: {
          "selected_localdata": [
            {
              "value": 0,
              "text": "否"
            },
            {
              "value": 1,
              "text": "是"
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onLoad(e) {
      if (e.id) {
        const id = e.id
        this.formDataId = id
        this.getDetail(id)
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
        db.collection(dbCollectionName).doc(id).field("num,title,desc,cover,selected,videofile,start_score,end_score,category_id").get().then((res) => {
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
