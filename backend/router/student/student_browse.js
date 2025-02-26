// 学生获取课程信息接口

const express = require('express');
const router = express.Router();
const studentBrowseController = require('../../router_handler/student/student_browse');

/**
 * 获取课程列表
 * @route GET /api/student/courses
 * @group 学生课程管理 - 学生课程相关操作
 * @returns {object} 200 - 返回课程列表
 * @returns {Error} 500 - 服务器错误
 */
router.get('/courses', studentBrowseController.getCourses);

module.exports = router;