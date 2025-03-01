const db = require('../../db/index'); 
const bcrypt = require('bcryptjs');

// 获取所有教师信息
exports.getAllTeachers = (req, res) => {
  // 查询所有教师信息的 SQL 语句
  const sql = 'SELECT teacher_id, name, gender, title, department, phone, email, created_at, updated_at, avatar_url FROM teachers';
  // 查询教师总人数的 SQL 语句
  const countSql = 'SELECT COUNT(*) as total FROM teachers';
  
  // 先查询教师总人数
  db.query(countSql, (countErr, countResults) => {
    if (countErr) return res.cc(countErr);
    const total = countResults[0].total;

    // 再查询所有教师信息
    db.query(sql, (err, results) => {
      if (err) return res.cc(err);
      res.send({
        status: 0,
        message: '获取教师信息成功！',
        total: total,  // 添加总人数信息到返回结果中
        data: results,
      });
    });
  });
};

// 根据教师ID删除教师
exports.deleteTeacherById = (req, res) => {
  const teacherId = req.params.teacherId;
  const sql = 'DELETE FROM teachers WHERE teacher_id = ?';
  db.query(sql, teacherId, (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows === 0) return res.cc('删除教师失败,教师ID不存在!');
    res.send({
      status: 0,
      message: '删除教师成功！',
    });
  });
};

// 根据教师ID重置教师密码
exports.resetTeacherPassword = (req, res) => {
  const teacherId = req.params.teacherId;
  const newPassword = 'password'; // 默认重置密码
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) return res.cc(err);
    const sql = 'UPDATE teachers SET password = ? WHERE teacher_id = ?';
    db.query(sql, [hashedPassword, teacherId], (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows === 0) return res.cc('重置密码失败,教师ID不存在!');
      res.send({
        status: 0,
        message: '重置密码成功！',
      });
    });
  });
};