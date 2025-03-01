const express = require('express');
const router = express.Router();
const { getStudentInfo, updateStudentInfo , updateStudentPassword } = require('../../router_handler/student/student_home');
const upload = require('../../middleware/upload');

// 导入验证数据的中间件
const expressJoi = require('@escook/express-joi');
// 导入需要的验证规则对象
const { update_studentinfo_schema , update_password_schema } = require('../../schema/user');

/**
 * 获取学生个人信息路由
 * GET /api/student/info
 */
router.get('/info', getStudentInfo);

/**
 * 更新学生个人信息路由
 * POST /api/student/update
 * 使用upload中间件处理单个文件上传，字段名为avatar
 */
router.post('/update', upload.single('avatar_url'), expressJoi(update_studentinfo_schema), updateStudentInfo);

// 在原有路由后新增密码修改路由
/**
 * 修改学生密码路由
 * POST /api/student/updatepwd
 */
router.post('/updatepwd', expressJoi(update_password_schema), updateStudentPassword);

// 导出路由模块
module.exports = router;