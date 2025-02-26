const express = require('express')
const router = express.Router()
// 导入验证规则
const { student_reg_schema, student_login_schema } = require('../../schema/user')
// 导入验证中间件
const expressJoi = require('@escook/express-joi')
// 注册和登录的处理函数模块
const { regUser, login } = require('../../router_handler/student/login_reg')

// 注册新用户 - 使用注册验证规则
router.post('/register', expressJoi(student_reg_schema), regUser)
// 登录 - 使用登录验证规则
router.post('/login', expressJoi(student_login_schema), login)

module.exports = router
