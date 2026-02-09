// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "uid": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "用户ID",
    "label": "用户ID"
  },
  "nickname": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "用户昵称",
    "label": "用户昵称"
  },
  "score": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      }
    ],
    "title": "分数",
    "label": "分数"
  },
  "scoreList": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "title": "分数记录",
    "label": "分数记录"
  },
  "answerList": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "title": "答题记录",
    "label": "答题记录"
  },
  "surveysId": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "问卷ID",
    "label": "问卷ID"
  },
  "anserTime": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "timestamp"
      }
    ],
    "title": "答题时间",
    "label": "答题时间"
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
