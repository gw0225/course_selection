const express = require('express');
const router = express.Router();
const { 
  getCourses, 
  createCourse, 
  updateCourse,
  deleteCourse 
} = require('../../router_handler/teacher/course_release');

// 查看已发布课程
router.get('/courses', getCourses);

// 发布新课程
router.post('/courses', createCourse);

// 更新课程信息
router.put('/courses/:course_id', updateCourse);

// 删除课程
router.delete('/courses/:course_id', deleteCourse);

module.exports = router;