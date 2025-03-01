const express = require('express');
const router = express.Router();
const adminTeacherController = require('../../router_handler/admin/admin_teacher');

// 获取所有教师信息
router.get('/teachers', adminTeacherController.getAllTeachers);

// 根据教师ID删除教师
router.delete('/teachers/:teacherId', adminTeacherController.deleteTeacherById);

// 根据教师ID重置教师密码
router.post('/teachers/:teacherId/repassword', adminTeacherController.resetTeacherPassword);

module.exports = router;
