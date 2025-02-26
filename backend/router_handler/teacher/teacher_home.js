const db = require('../../db/index');
const path = require('path');

// 获取教师个人信息
exports.getTeacherInfo = (req, res) => {
  const teacher_id = req.user.teacher_id; // 从JWT中获取教师ID

  const sql = `
    SELECT 
      teacher_id, name, gender, avatar_url, 
      title, department, phone, email 
    FROM teachers 
    WHERE teacher_id = ?
  `;

  db.query(sql, teacher_id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc('获取教师信息失败');
    res.send({ status: 0, message: '获取成功', data: results[0] });
  });
};


// 更新教师个人信息
exports.updateTeacherInfo = (req, res) => {
  const teacher_id = req.user.teacher_id;
  const userinfo = req.body;

  // 处理头像路径
  if (req.file) {
    userinfo.avatar_url = `/avatar/${req.file.originalname}`;
  }

  const sql = 'UPDATE teachers SET ? WHERE teacher_id = ?';
  
  db.query(sql, [userinfo, teacher_id], (err, results) => {
    if (err) return res.cc(err);
    if (results.affectedRows !== 1) return res.cc('更新失败');
    res.cc('更新成功', 0);
  });
};