const db = require('../../db/index');
const bcrypt = require('bcryptjs');

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

// 修改密码的处理函数
exports.updatePassword = (req, res) => {
  const teacher_id = req.user.teacher_id;

  // 1. 根据id查询教师是否存在
  const sql = `SELECT * FROM teachers WHERE teacher_id=?`;
  db.query(sql, teacher_id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc('教师不存在！');

    const teacherInfo = results[0];

    // 2. 判断提交的旧密码是否正确
    const compareResult = bcrypt.compareSync(req.body.old_pwd, teacherInfo.password);
    if (!compareResult) return res.cc('旧密码错误！');

    // 3. 对新密码进行加密处理
    const newPassword = bcrypt.hashSync(req.body.new_pwd, 10);

    // 4. 更新密码
    const updateSql = `UPDATE teachers SET password=? WHERE teacher_id=?`;
    db.query(updateSql, [newPassword, teacher_id], (err, results) => {
      if (err) return res.cc(err);
      if (results.affectedRows !== 1) return res.cc('更新密码失败！');
      res.cc('更新密码成功！', 0);
    });
  });
};
