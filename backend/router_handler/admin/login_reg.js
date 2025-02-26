// 导入数据库操作模块
const db = require('../../db/index')
// 导入 bcryptjs 用于密码加密
const bcrypt = require('bcryptjs')
// 导入生成 Token 的包
const jwt = require('jsonwebtoken')
// 导入全局的配置文件
const config = require('../../config')

// 管理员注册处理函数
exports.regAdmin = (req, res) => {
  const userinfo = req.body

  // 1. 密码验证
  if (!userinfo.password || !userinfo.repassword) {
    return res.cc('密码和确认密码都是必填项！')
  }

  if (userinfo.password !== userinfo.repassword) {
    return res.cc('密码和确认密码不一致！')
  }

  // 2. 检查管理员工号是否已存在
  const sqlStr = 'select * from admins where admin_id=?'
  db.query(sqlStr, userinfo.admin_id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length > 0) return res.cc('该工号已被注册！')

    // 3. 对密码进行加密处理
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)

    // 4. 插入新管理员数据
    const sql = 'insert into admins set ?'
    db.query(sql, {
      name: userinfo.username,
      admin_id: userinfo.admin_id,
      password: userinfo.password,
    }, (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('注册管理员失败！')
      res.cc('注册成功！', 0)
    })
  })
}

// 管理员登录处理函数
exports.loginAdmin = (req, res) => {
  const userinfo = req.body

  const sql = 'select * from admins where admin_id=?'
  db.query(sql, userinfo.admin_id, (err, results) => {
    if (err) return res.cc('数据库查询失败，请稍后重试')
    if (results.length !== 1) return res.cc('该工号未注册，请先注册后再登录')

    // 判断密码是否正确
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
    if (!compareResult) return res.cc('密码错误，请重新输入')

    // 生成 Token
    const user = { ...results[0], password: '' }
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })

    res.send({
      status: 0,
      message: '登录成功！',
      token: tokenStr,
      name: results[0].name,
      admin_id: results[0].admin_id
    })
  })
}
