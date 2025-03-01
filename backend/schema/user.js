// 导入 joi 包，用于定义数据验证规则
const joi = require('joi')

// 用户名验证规则 - 只允许中文和英文字符
const username = joi.string().pattern(/^[\u4e00-\u9fa5a-zA-Z]{2,12}$/).required()
// 密码验证规则
const password = joi.string().pattern(/^[\S]{6,12}$/).required()


// 学号验证规则
const student_id = joi.string().pattern(/^[0-9]{8,12}$/).required()

// 学生注册验证规则对象
exports.student_reg_schema = {
    body: {
        username,
        password,
        repassword: password,
        student_id,
    },
}

// 学生登录验证规则对象
exports.student_login_schema = {
    body: {
        student_id,
        password,
    },
}

// 教师工号验证规则
const teacher_id = joi.string().pattern(/^T\d{7,9}$/).required()

// 教师注册验证规则对象
exports.teacher_reg_schema = {
    body: {
        username,
        password,
        repassword: password,
        teacher_id,
    },
}

// 教师登录验证规则对象
exports.teacher_login_schema = {
    body: {
        teacher_id,
        password,
    },
}

// 管理员工号验证规则
const admin_id = joi.string().pattern(/^A\d{7,9}$/).required()

// 管理员注册验证规则对象
exports.admin_reg_schema = {
    body: {
        username,
        password,
        repassword: password,
        admin_id,
    },
}

// 管理员登录验证规则对象
exports.admin_login_schema = {
    body: {
        admin_id,
        password,
    },
}

// 更新个人信息的验证规则
const name = joi.string().pattern(/^[\u4e00-\u9fa5a-zA-Z]{2,12}$/).allow('')
const gender = joi.string().valid('男', '女', '').allow('')
const avatar_url = joi.string().allow('')
const faculty = joi.string().allow('')
const class_name = joi.string().allow('')
const phone = joi.string().pattern(/^1\d{10}$/).allow('')
const email = joi.string().email().allow('')
const title = joi.string().allow('')  // 允许任意字符串或为空

// 学生更新个人信息的验证规则对象
exports.update_studentinfo_schema = {
    body: {
        name,
        gender,
        avatar_url,
        faculty,
        class_name,
        phone,
        email,
    },
}
// 教师更新个人信息的验证规则对象
exports.update_teacherinfo_schema = {
    body: {
        name,       // 姓名：2-12位中文或英文
        gender,     // 性别：男/女/空
        avatar_url, // 头像URL：允许任意字符串
        faculty,    // 院系：允许任意字符串
        title,      // 职称：允许任意字符串
        phone,      // 手机号：1开头11位数字
        email,      // 邮箱：标准邮箱格式
    },
}
// 管理员更新个人信息的验证规则对象
exports.update_admininfo_schema = {
    body: {
        name,
        phone,
        email,
    }
}

// 新增密码修改验证规则
const old_pwd = password
const new_pwd = joi.not(joi.ref('old_pwd')).concat(password)

exports.update_password_schema = {
  body: {
    old_pwd,
    new_pwd
  }
}