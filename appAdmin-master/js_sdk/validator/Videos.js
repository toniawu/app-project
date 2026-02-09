// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "num": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      }
    ],
    "title": "视频编号",
    "label": "视频编号"
  },
  "title": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "视频标题",
    "label": "视频标题"
  },
  "desc": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "视频描述",
    "label": "视频描述"
  },
  "cover": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "file"
      }
    ],
    "title": "封面",
    "label": "封面"
  },
  "videofile": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "file"
      }
    ],
    "title": "视频文件",
    "label": "视频文件"
  },
   "selected": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "title": "精选 0 否 1是 ",
    "label": "精选 0 否 1是 "
  },
  "start_score": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "title": "起始分数",
    "label": "起始分数"
  },
  "end_score": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "title": "结束分数",
    "label": "结束分数"
  },
  "category_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "分类编号",
    "label": "分类编号"
  }
}

const enumConverter = {}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
