// 导入数据库操作模块
const db = require('../../db/index');
// 导入 bcryptjs 模块
const bcrypt = require('bcryptjs');

/**
 * 获取学生个人信息的处理函数
 */
exports.getStudentInfo = (req, res) => {
  const student_id = req.user.student_id;
  const sql = 'SELECT student_id, name, gender, avatar_url, faculty, class_name, phone, email FROM students WHERE student_id = ?';
  db.query(sql, student_id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc('获取个人信息失败！');
    res.send({
      status: 0,
      message: '获取个人信息成功！',
      data: results[0]
    });
  });
};

/**
 * 更新学生个人信息的处理函数
 */
exports.updateStudentInfo = (req, res) => {
  const student_id = req.user.student_id;
  const userinfo = req.body;
  if (req.file) {
    userinfo.avatar_url = `/avatar/${req.file.originalname}`;
  }
  const sql = 'UPDATE students SET ? WHERE student_id = ?';
  db.query(sql, [userinfo, student_id], (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows !== 1) return res.cc('更新个人信息失败！');
    res.cc('更新个人信息成功！', 0);
  });
};

/**
 * 修改学生密码的处理函数
 */
exports.updateStudentPassword = (req, res) => {
  const student_id = req.user.student_id;
  const { old_pwd, new_pwd } = req.body;

  // 1. 验证旧密码是否正确
  const checkSql = 'SELECT password FROM students WHERE student_id = ?';
  db.query(checkSql, student_id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc('用户不存在！');

    // 使用 bcrypt 比对密码
    const compareResult = bcrypt.compareSync(old_pwd, results[0].password);
    if (!compareResult) return res.cc('原密码错误！');

    // 2. 更新新密码
    const newPwd = bcrypt.hashSync(new_pwd, 10);
    const updateSql = 'UPDATE students SET password = ? WHERE student_id = ?';
    db.query(updateSql, [newPwd, student_id], (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows !== 1) return res.cc('密码更新失败！');
      res.cc('密码修改成功！', 0);
    });
  });
};