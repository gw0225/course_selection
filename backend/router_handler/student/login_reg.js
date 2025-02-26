// 导入数据库操作模块
const db = require('../../db/index')
// 导入 bcryptjs 这个包
const bcrypt = require('bcryptjs')
// 导入生成 Token 的包
const jwt = require('jsonwebtoken')
// 导入全局的配置文件
const config = require('../../config')

// 注册处理函数
exports.regUser = (req, res) => {
  const userinfo = req.body  // 获取客户端提交的注册信息
  
  // 1. 密码验证
  if (!userinfo.password || !userinfo.repassword) {
    console.log('密码验证失败：', {
      password: userinfo.password,
      repassword: userinfo.repassword
    })
    return res.cc('密码和确认密码都是必填项！')
  }
  
  if (userinfo.password !== userinfo.repassword) {
    return res.cc('密码和确认密码不一致！')
  }
  
  // 2. 检查学号是否已存在
  const sqlStr = 'select * from students where student_id=?'
  db.query(sqlStr, userinfo.student_id, (err, results) => {
    if (err) return res.cc(err)                    // 数据库查询出错
    if (results.length > 0) return res.cc('该学号已被注册！')  // 学号已存在
    
    // 3. 对密码进行加密处理
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)  // 10是加密的强度
    
    // 4. 插入新用户数据
    const sql = 'insert into students set ?'
    db.query(sql, {
      name: userinfo.username,
      student_id: userinfo.student_id,
      password: userinfo.password
    }, (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('注册用户失败！')
      res.cc('注册成功！', 0)  // 0表示成功状态
    })
  })
}

// 登录处理函数
exports.login = (req, res) => {
  const userinfo = req.body
  
  const sql = 'select * from students where student_id=?'
  db.query(sql, userinfo.student_id, (err, results) => {
    // 数据库查询错误
    if (err) {
      return res.cc('数据库查询失败，请稍后重试')
    }
    
    // 用户不存在
    if (results.length !== 1) {
      return res.cc('该学号未注册，请先注册后再登录')
    }
    
    // 判断密码是否正确
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
    if (!compareResult) {
      return res.cc('密码错误，请重新输入')
    }
    
    // 生成 Token
    const user = { ...results[0], password: '' }
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
    
    res.send({
      status: 0,
      message: '登录成功！',
      token: tokenStr,
      name: results[0].name,
      student_id: results[0].student_id
    })
  })
}
