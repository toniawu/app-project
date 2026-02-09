// 本文件中的内容将在云对象【运行】时解析为运行参数
// 配置教程参考：https://uniapp.dcloud.net.cn/uniCloud/rundebug.html#run-obj-param
await answerQuestionnaire({
    "_id": "676a1904bd0220e817be0c1f",
    "num": 20,
    "title": "测试删除问题",
    "description": "测试删除问题",
    "category_id": "66965adae0ec199b18e23efb",
    "questions": [
        {
            "question_id": "67695962466d41729b9ed720",
            "question_type": 0,
            "question_num_type": 0,
            "content": "测试第二个问题",
            "select_options": [
                {
                    "_id": "6769239b1c90b6b5563ee292",
                    "content": "测试加两个选项",
                    "state": 1
                },
                {
                    "_id": "6769239b1c90b6b5563ee292",
                    "content": "测试加两个选项",
                    "state": 1
                },
                {
                    "_id": "6769239b1c90b6b5563ee292",
                    "content": "测试加两个选项",
                    "state": 1
                },
                {
                    "_id": "6769238221821bf1c7846fd5",
                    "content": "测试加一个选项",
                    "state": 0
                }
            ],
            "answer_type": 1,
			"answer":[3]
        },
        {
            "question_id": "67692b35a09a9be4be078b32",
            "question_type": 1,
            "question_num_type": 0,
            "content": "测试第一个填空题",
            "answer_type": 0,
			"answer":['我回答了填空题']
        }
    ]
})