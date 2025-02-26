const express = require('express');
const router = express.Router();
const selectedStudentsController = require('../../router_handler/teacher/selected_students');

/**
 * 查看课程的已选学生
 * @route GET /api/teacher/selected-students
 * @group 教师课程管理 - 教师查看已选学生
 * @param {number} course_id.query.required - 课程ID
 * @returns {object} 200 - 返回已选学生列表
 * @security JWT
 */
router.get('/selected-students', selectedStudentsController.getSelectedStudents);


/**
 * 强制退选学生
 * @route POST /api/teacher/force-deselect
 * @group 教师课程管理 - 教师强制退选
 * @param {string} student_id.body.required - 学生ID
 * @param {number} course_id.body.required - 课程ID
 * @returns {object} 200 - 退选结果
 * @security JWT
 */
router.post('/force-deselect', selectedStudentsController.deselectStudent);

module.exports = router;
