const db = require('../../db/index');
const bcrypt = require('bcryptjs');

// 获取所有学生信息
exports.getAllStudents = (req, res) => {
  // 查询所有学生信息的 SQL 语句
  const sqlStudents = 'SELECT student_id, name, gender, faculty, class_name, phone, email, created_at, updated_at, avatar_url FROM students';
  // 查询学生总人数的 SQL 语句
  const sqlCount = 'SELECT COUNT(*) as count FROM students';

  // 先查询所有学生信息
  db.query(sqlStudents, (err, studentResults) => {
    if (err) {
      return res.cc(err);
    }

    // 再查询学生总人数
    db.query(sqlCount, (err, countResults) => {
      if (err) {
        return res.cc(err);
      }

      // 组装返回数据，包含学生信息和总人数
      const responseData = {
        status: 0,
        message: '获取学生信息成功！',
        total: countResults[0].count,
        data: studentResults,
      };

      res.send(responseData);
    });
  });
};

// 根据学生ID删除学生
exports.deleteStudentById = (req, res) => {
  const studentId = req.params.studentId;
  const sql = 'DELETE FROM students WHERE student_id = ?';
  db.query(sql, studentId, (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows === 0) return res.cc('删除学生失败,学生ID不存在!');
    res.send({
      status: 0,
      message: '删除学生成功！',
    });
  });
};

// 根据学生ID重置学生密码
exports.resetStudentPassword = (req, res) => {
  const studentId = req.params.studentId;
  const newPassword = 'password'; // 默认重置密码
  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) return res.cc(err);
    const sql = 'UPDATE students SET password = ? WHERE student_id = ?';
    db.query(sql, [hashedPassword, studentId], (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows === 0) return res.cc('重置密码失败,学生ID不存在!');
      res.send({
        status: 0,
        message: '重置密码成功！',
      });
    });
  });
};