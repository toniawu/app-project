<template>
  <view>
    <view class="uni-header">
      <view class="uni-group">
        <view class="uni-title"></view>
        <view class="uni-sub-title"></view>
      </view>
      <view class="uni-group">
        <input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
        <button class="uni-button" type="default" size="mini" @click="search">搜索</button>
        <button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
        <!-- <button class="uni-button" type="default" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button> -->
        <download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
          <button class="uni-button" type="primary" size="mini">导出 Excel</button>
        </download-excel>
      </view>
    </view>
    <view class="uni-container">
      <unicloud-db ref="udb" :collection="collectionList" field="next_num,next_interval_day,num,title,description,category_id,questions" :where="where" page-data="replace"
        :orderby="orderby" :getcount="true" :page-size="options.pageSize" :page-current="options.pageCurrent"
        v-slot:default="{data,pagination,loading,error,options}" :options="options" loadtime="manual" @load="onqueryload">
        <uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe type="selection" @selection-change="selectionChange">
          <uni-tr>
            <uni-th align="center" >序号</uni-th>
            <uni-th align="center">问卷标题</uni-th>
            <uni-th align="center" >问卷描述</uni-th>
            <uni-th align="center" >下一个问卷序号</uni-th>
			 <uni-th align="center" >下一个问卷触发间隔天数</uni-th>
			  <uni-th align="center" >分类编号</uni-th>
            <uni-th align="center" >题目</uni-th>
            <uni-th align="center">操作</uni-th>
          </uni-tr>
          <uni-tr v-for="(item,index) in data" :key="index">
            <uni-td align="center">{{item.num}}</uni-td>
            <uni-td align="center">{{item.title}}</uni-td>
            <uni-td align="center">{{item.next_num}}</uni-td>
            <uni-td align="center">{{item.next_interval_day}}</uni-td>
            <uni-td align="center">{{item.description}}</uni-td>
            <uni-td align="center">
				<uni-data-select  v-model="item.category_id" :disabled="true"
					collection="Category" field="_id as value, title as text">
				</uni-data-select>
			</uni-td>
            <uni-td align="center">
				<uni-forms-item v-for="(option,index) in item.questions"
					name="select_options" :label="`题目${index+1}`" required >
							   <uni-data-select
							   :disabled="true"
									v-model="option.question_id"
									:localdata="questions"
								  ></uni-data-select>
				</uni-forms-item>
			</uni-td>
            <uni-td align="center">
              <view class="uni-group">
                <button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
                <!-- <button @click="confirmDelete(item._id)" class="uni-button" size="mini" type="warn">删除</button> -->
              </view>
            </uni-td>
          </uni-tr>
        </uni-table>
        <view class="uni-pagination-box">
          <uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
        </view>
      </unicloud-db>
    </view>
  </view>
</template>

<script>
  import { enumConverter, filterToWhere } from '../../js_sdk/validator/questionnaire.js';

  const db = uniCloud.database()
  // 表查询配置
  const dbOrderBy = '' // 排序字段
  const dbSearchFields = [] // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
  // 分页配置
  const pageSize = 20
  const pageCurrent = 1

  const orderByMapping = {
    "ascending": "asc",
    "descending": "desc"
  }
//选择题表
  const dbSelectQuestionName = 'select_question';
  //填空题表
  const dbFillQuestionName = 'fill_blank';
  export default {
    data() {
      return {
		  questions:[],
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
        collectionList: "questionnaire",
        query: '',
        where: '',
        orderby: dbOrderBy,
        orderByFieldName: "",
        selectedIndexs: [],
        options: {
          pageSize,
          pageCurrent,
          filterData: {},
          ...enumConverter
        },
        imageStyles: {
          width: 64,
          height: 64
        },
        exportExcel: {
          "filename": "questionnaire.xls",
          "type": "xls",
          "fields": {
            "序号": "num",
            "问卷标题": "title",
            "问卷描述": "description",
            "分类编号": "category_id",
            "题目": "questions"
          }
        },
        exportExcelData: []
      }
    },
    onLoad() {
		 this.getQuestions();
      this._filter = {}
    },
    onReady() {
      this.$refs.udb.loadData()
    },
    methods: {
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
      onqueryload(data) {
        this.exportExcelData = data
      },
      getWhere() {
        const query = this.query.trim()
        if (!query) {
          return ''
        }
        const queryRe = new RegExp(query, 'i')
        return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
      },
      search() {
        const newWhere = this.getWhere()
        this.where = newWhere
        this.$nextTick(() => {
          this.loadData()
        })
      },
      loadData(clear = true) {
        this.$refs.udb.loadData({
          clear
        })
      },
      onPageChanged(e) {
        this.selectedIndexs.length = 0
        this.$refs.table.clearSelection()
        this.$refs.udb.loadData({
          current: e.current
        })
      },
      navigateTo(url, clear) {
        // clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
        uni.navigateTo({
          url,
          events: {
            refreshData: () => {
              this.loadData(clear)
            }
          }
        })
      },
      // 多选处理
      selectedItems() {
        var dataList = this.$refs.udb.dataList
        return this.selectedIndexs.map(i => dataList[i]._id)
      },
      // 批量删除
      delTable() {
        this.$refs.udb.remove(this.selectedItems(), {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      // 多选
      selectionChange(e) {
        this.selectedIndexs = e.detail.index
      },
      confirmDelete(id) {
        this.$refs.udb.remove(id, {
          success:(res) => {
            this.$refs.table.clearSelection()
          }
        })
      },
      sortChange(e, name) {
        this.orderByFieldName = name;
        if (e.order) {
          this.orderby = name + ' ' + orderByMapping[e.order]
        } else {
          this.orderby = ''
        }
        this.$refs.table.clearSelection()
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      },
      filterChange(e, name) {
        this._filter[name] = {
          type: e.filterType,
          value: e.filter
        }
        let newWhere = filterToWhere(this._filter, db.command)
        if (Object.keys(newWhere).length) {
          this.where = newWhere
        } else {
          this.where = ''
        }
        this.$nextTick(() => {
          this.$refs.udb.loadData()
        })
      }
    }
  }
</script>

<style>
</style>
