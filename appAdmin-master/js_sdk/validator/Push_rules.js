// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "serial": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      }
    ],
    "title": "序号",
    "label": "序号"
  },
  "surveyNum": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "title": "问卷序号",
    "label": "问卷序号"
  },
  "survey_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "关联问卷",
    "label": "关联问卷"
  },
  "videoNum": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      }
    ],
    "title": "视频序号",
    "label": "视频序号"
  },
  "video_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "title": "关联视频",
    "label": "关联视频"
  },
  "questions": {
    "rules": [
      {
        "format": "array"
      }
    ],
    "title": "关联问题",
    "label": "关联问题"
  },
  "pushDate": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "timestamp"
      }
    ],
    "title": "推送日期",
    "label": "推送日期"
  },
  "min_score": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "title": "最低分数",
    "label": "最低分数"
  },
  "max_score": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "title": "最高分数",
    "label": "最高分数"
  },
  "pushWeek": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "int"
      },
      {
        "range": [
          {
            "value": 1,
            "text": 1
          },
          {
            "value": 2,
            "text": 2
          },
          {
            "value": 3,
            "text": 3
          },
          {
            "value": 4,
            "text": 4
          },
          {
            "value": 5,
            "text": 5
          },
          {
            "value": 6,
            "text": 6
          },
          {
            "value": 7,
            "text": 7
          },
          {
            "value": 8,
            "text": 8
          },
          {
            "value": 9,
            "text": 9
          },
          {
            "value": 10,
            "text": 10
          },
          {
            "value":11,
            "text": 11
          },
          {
            "value": 12,
            "text": 12
          }
        ]
      }
    ],
    "title": "答题后第N周",
    "label": "答题后第N周"
  }
}

const enumConverter = {
  "pushWeek_valuetotext": {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "11": 11,
    "12": 12
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
