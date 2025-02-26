// 导入数据库操作模块
const db = require('../../db/index');

/**
 * 获取学生个人信息的处理函数
 * @param {Object} req - 请求对象，包含用户信息
 * @param {Object} res - 响应对象，用于返回结果
 */
exports.getStudentInfo = (req, res) => {
  // 从请求中获取当前登录学生的ID
  const student_id = req.user.student_id;

  // 定义SQL查询语句，查询学生基本信息
  const sql = 'SELECT student_id, name, gender, avatar_url, faculty, class_name, phone, email FROM students WHERE student_id = ?';

  // 执行数据库查询
  db.query(sql, student_id, (err, results) => {
    // 如果查询出错，返回错误信息
    if (err) return res.cc(err);

    // 如果查询结果不是一条记录，返回失败信息
    if (results.length !== 1) return res.cc('获取个人信息失败！');

    // 返回成功响应，包含学生信息
    res.send({
      status: 0, // 状态码0表示成功
      message: '获取个人信息成功！',
      data: results[0] // 返回查询到的学生信息
    });
  });
};

/**
 * 更新学生个人信息的处理函数
 * @param {Object} req - 请求对象，包含用户信息和更新数据
 * @param {Object} res - 响应对象，用于返回结果
 */
exports.updateStudentInfo = (req, res) => {
  // 从请求中获取当前登录学生的ID
  const student_id = req.user.student_id;

  // 从请求体中获取要更新的用户信息
  const userinfo = req.body;

  // 如果有上传的头像文件，更新头像路径
  if (req.file) {
    userinfo.avatar_url = `/avatar/${req.file.originalname}`;
  }

  // 定义SQL更新语句
  const sql = 'UPDATE students SET ? WHERE student_id = ?';

  // 执行数据库更新操作
  db.query(sql, [userinfo, student_id], (err, results) => {
    // 如果更新出错，返回错误信息
    if (err) return res.cc(err);

    // 如果受影响行数不是1，返回失败信息
    if (results.affectedRows !== 1) return res.cc('更新个人信息失败！');

    // 返回成功响应
    res.cc('更新个人信息成功！', 0);
  });
};