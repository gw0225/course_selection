const express = require('express');
const router = express.Router();
const { getTeacherInfo, updateTeacherInfo } = require('../../router_handler/teacher/teacher_home');
const upload = require('../../middleware/upload');
const expressJoi = require('@escook/express-joi');
const { update_teacherinfo_schema } = require('../../schema/user');

// 获取教师个人信息
router.get('/info', getTeacherInfo);

// 更新教师个人信息（支持头像上传）
router.post('/update', upload.single('avatar_url'), expressJoi(update_teacherinfo_schema), updateTeacherInfo);

module.exports = router;