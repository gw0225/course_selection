const express = require('express')
const router = express.Router()
const admin_home_handler = require('../../router_handler/admin/admin_home')

// 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象
const { update_admininfo_schema } = require('../../schema/user')

// 获取管理员信息
router.get('/info', admin_home_handler.getAdminInfo)

// 更新管理员信息
router.post('/update', expressJoi(update_admininfo_schema), admin_home_handler.updateAdminInfo)

module.exports = router
