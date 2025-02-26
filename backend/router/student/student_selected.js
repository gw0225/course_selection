// 学生选课路由接口

const express = require('express');
const router = express.Router();
const studentSelectedController = require('../../router_handler/student/student_selected');

/**
 * 学生选课
 * @route POST /api/student/select-course
 * @group 学生课程管理 - 学生选课相关操作
 * @param {string} courseId.body.required - 课程ID
 * @returns {object} 200 - 选课成功
 * @returns {Error} 500 - 服务器错误
 * @security JWT
 */
router.post('/select-course', studentSelectedController.selectCourse);

/**
 * 查看已选课程
 * @route GET /api/student/selected-courses
 * @group 学生课程管理 - 学生选课相关操作
 * @returns {object} 200 - 返回已选课程列表
 * @security JWT
 */
router.get('/selected-courses', studentSelectedController.getSelectedCourses);

/**
 * 退选课程
 * @route DELETE /api/student/drop-course
 * @group 学生课程管理 - 学生选课相关操作
 * @param {string} courseId.body.required - 课程ID
 * @returns {object} 200 - 退选成功
 * @security JWT
 */
router.delete('/drop-course', studentSelectedController.dropCourse);

module.exports = router;