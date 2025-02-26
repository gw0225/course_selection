const express = require('express')
const router = express.Router()

// 导入验证规则
const { 
  teacher_reg_schema,
  teacher_login_schema 
} = require('../../schema/user')

// 导入处理函数
const { 
  regTeacher,
  loginTeacher
} = require('../../router_handler/teacher/login_reg')

// 导入验证中间件
const expressJoi = require('@escook/express-joi')

// 注册新教师
router.post('/regteacher', expressJoi(teacher_reg_schema), regTeacher)

// 教师登录
router.post('/loginteacher', expressJoi(teacher_login_schema), loginTeacher)

module.exports = router
