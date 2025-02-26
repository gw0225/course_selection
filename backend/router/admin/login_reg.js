const express = require('express')
const router = express.Router()

// 导入验证规则
const { 
  admin_reg_schema,
  admin_login_schema 
} = require('../../schema/user')

// 导入处理函数
const { 
  regAdmin,
  loginAdmin
} = require('../../router_handler/admin/login_reg')

// 导入验证中间件
const expressJoi = require('@escook/express-joi')

// 注册新管理员
router.post('/regadmin', expressJoi(admin_reg_schema), regAdmin)

// 管理员登录
router.post('/loginadmin', expressJoi(admin_login_schema), loginAdmin)

module.exports = router
