// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "survey_id": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "title": "所属问卷ID",
    "label": "所属问卷ID"
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
    "title": "问题标题",
    "label": "问题标题"
  },
  "type": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      },
      {
        "range": [
          {
            "text": "单选",
            "value": "SINGLE"
          },
          {
            "text": "多选",
            "value": "MULTY"
          }
        ]
      }
    ],
    "title": "问题类型",
    "label": "问题类型"
  },
  "surName": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "关联问卷表",
    "label": "关联问卷表"
  },
  "options": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "选项1",
    "label": "选项1"
  },
  "options2": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "选项2",
    "label": "选项2"
  },
  "options3": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "选项3",
    "label": "选项3"
  },
  "options4": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "选项4",
    "label": "选项4"
  },
  "options5": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "选项5",
    "label": "选项5"
  }
}

const enumConverter = {
  "type_valuetotext": {
    "SINGLE": "单选",
    "MULTY": "多选"
  }
}

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
