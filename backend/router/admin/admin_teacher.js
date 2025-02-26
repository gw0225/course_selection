const express = require('express')
const router = express.Router()
const adminTeacherHandler = require('../../router_handler/admin/admin_teacher')

// 获取所有教师信息
router.get('/teachers', adminTeacherHandler.getAllTeachers)

// 删除教师账号
router.delete('/teacher/:teacherId', adminTeacherHandler.deleteTeacher)

// 禁用/启用教师账号
router.put('/teacher/:teacherId/status', adminTeacherHandler.toggleTeacherStatus)

// 重置教师密码
router.put('/teacher/:teacherId/password', adminTeacherHandler.resetTeacherPassword)

module.exports = router
