const db = require('../../db/index')
const bcrypt = require('bcryptjs')

// 获取所有教师信息
exports.getAllTeachers = (req, res) => {
  const sql = `
    SELECT 
      t.teacher_id,
      t.name as username,
      t.gender,
      t.email,
      t.phone,
      t.department,
      t.title,
      t.avatar_url,
      t.created_at,
      t.updated_at,
      IFNULL(course_stats.course_count, 0) as course_count
    FROM teachers t
    LEFT JOIN (
      SELECT teacher_id, COUNT(*) as course_count
      FROM courses
      GROUP BY teacher_id
    ) course_stats ON t.teacher_id = course_stats.teacher_id
    ORDER BY t.created_at DESC`

  db.query(sql, (err, results) => {
    if (err) {
      console.error('获取教师列表失败:', err)
      return res.cc('获取教师列表失败')
    }
    res.send({
      status: 0,
      message: '获取教师列表成功',
      data: results
    })
  })
}

// 删除教师账号
exports.deleteTeacher = (req, res) => {
  const teacherId = req.params.teacherId

  // 先检查教师是否存在
  const checkTeacherSQL = 'SELECT teacher_id FROM teachers WHERE teacher_id = ?'
  db.query(checkTeacherSQL, teacherId, (err, results) => {
    if (err) return res.cc('删除教师失败')
    if (results.length === 0) return res.cc('教师不存在')

    // 删除教师及相关数据
    const sql = `
      DELETE t, c, sc
      FROM teachers t
      LEFT JOIN courses c ON t.teacher_id = c.teacher_id
      LEFT JOIN student_courses sc ON c.course_id = sc.course_id
      WHERE t.teacher_id = ?`

    db.query(sql, teacherId, (err, results) => {
      if (err) {
        console.error('删除教师失败:', err)
        return res.cc('删除教师失败')
      }
      res.cc('删除教师成功', 0)
    })
  })
}

// 禁用/启用教师账号
exports.toggleTeacherStatus = (req, res) => {
  const teacherId = req.params.teacherId
  const { status } = req.body

  const sql = 'UPDATE teachers SET status = ? WHERE teacher_id = ?'
  db.query(sql, [status, teacherId], (err, results) => {
    if (err) {
      console.error('更新教师状态失败:', err)
      return res.cc('更新教师状态失败')
    }
    if (results.affectedRows !== 1) return res.cc('教师不存在')
    res.cc('更新教师状态成功', 0)
  })
}

// 重置教师密码
exports.resetTeacherPassword = (req, res) => {
  const teacherId = req.params.teacherId
  const password = bcrypt.hashSync('888888', 10)
  
  const sql = 'UPDATE teachers SET password = ? WHERE teacher_id = ?'
  db.query(sql, [password, teacherId], (err, results) => {
    if (err) {
      console.error('重置密码失败:', err)
      return res.cc('重置密码失败')
    }
    if (results.affectedRows !== 1) return res.cc('教师不存在')
    res.cc('重置密码成功', 0)
  })
}
