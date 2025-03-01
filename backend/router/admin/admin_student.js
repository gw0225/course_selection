const express = require('express');
const router = express.Router();
const adminStudentController = require('../../router_handler/admin/admin_student');

// 获取所有学生信息
router.get('/students', adminStudentController.getAllStudents);

// 根据学生ID删除学生
router.delete('/students/:studentId', adminStudentController.deleteStudentById);

// 根据学生ID重置学生密码
router.post('/students/:studentId/repassword', adminStudentController.resetStudentPassword);

module.exports = router;