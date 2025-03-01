// 导入Express框架
const express = require('express');
// 导入CORS中间件，用于处理跨域请求
const cors = require('cors');
// 导入路径处理模块
const path = require('path');
// 导入配置文件
const config = require('./config');
// 导入JWT认证中间件
const expressJWT = require('express-jwt').expressjwt;
// 导入数据验证库
const joi = require('joi');

// 创建Express应用实例
const app = express();

// 使用CORS中间件，允许跨域请求
app.use(cors());

// 使用JSON解析中间件
app.use(express.json());

// 使用URL编码解析中间件，支持嵌套对象解析
app.use(express.urlencoded({ extended: true }));

// 自定义响应处理中间件
app.use((req, res, next) => {
  // 为响应对象添加cc方法，用于统一返回错误信息
  res.cc = function (err, status = 1) {
    res.send({
      status, // 状态码，1表示错误，0表示成功
      message: err instanceof Error ? err.message : err, // 错误信息
    });
  };
  next(); // 继续处理下一个中间件
});

// 配置JWT认证中间件
app.use(
  expressJWT({
    secret: config.jwtSecretKey, // 使用配置文件中的JWT密钥
    algorithms: ['HS256'], // 指定加密算法
    requestProperty: 'user', // 将解析后的用户信息挂载到req.user
    credentialsRequired: true, // 要求请求必须携带token
  })
    // 配置不需要认证的路由
    .unless({
      path: [
        /^\/api\/(student|teacher|admin)\/(login|loginteacher|register|regteacher|loginadmin|regadmin)/, 
        /^\/avatar\/.*/
      ]
    })
);


// 导入学生登录注册路由
const studentLoginRouter = require('./router/student/login_reg');
// 导入学生主页路由
const studentHomeRouter = require('./router/student/student_home');
// 导入学生课程查询路由
const studentBrowseRouter = require('./router/student/student_browse');
// 导入学生选课路由
const studentSelectedRouter = require('./router/student/student_selected');
// 导入教师登录注册路由
const teacherLoginRouter = require('./router/teacher/login_reg');
// 导入教师主页路由
const teacherHomeRouter = require('./router/teacher/teacher_home');
// 导入教师课程管理路由
const teacherCourseRouter = require('./router/teacher/course_release');
// 导入教师已选学生管理路由
const teacherSelectedStudentsRouter = require('./router/teacher/selected_students');
// 导入管理员登录注册路由
const adminLoginRouter = require('./router/admin/login_reg');
// 导入管理员数据分析路由
const statsRouter = require('./router/admin/admin_stats');
// 导入并使用管理员主页路由模块
const adminHomeRouter = require('./router/admin/admin_home')
// 导入管理员管理教师的路由
const adminTeacherRouter = require('./router/admin/admin_teacher')
// 导入管理员管理学生的路由
const adminStudentRouter = require('./router/admin/admin_student')

// 注册学生相关路由
app.use('/api/student', studentLoginRouter); // 学生登录注册路由
app.use('/api/student', studentHomeRouter); // 学生主页路由
app.use('/api/student', studentBrowseRouter); // 学生课程查询路由
app.use('/api/student', studentSelectedRouter);// 学生选课路由
// 注册教师相关路由
app.use('/api/teacher', teacherLoginRouter); // 教师登录注册路由
app.use('/api/teacher', teacherHomeRouter); // 教师主页路由
app.use('/api/teacher', teacherCourseRouter); // 教师课程管理路由
app.use('/api/teacher', teacherSelectedStudentsRouter); // 教师已选学生管理路由
// 注册管理员相关路由
app.use('/api/admin', adminLoginRouter); // 管理员登录注册路由
app.use('/api/admin', statsRouter); // 管理员数据分析路由
app.use('/api/admin', adminHomeRouter) // 管理员主页路由
app.use('/api/admin', adminTeacherRouter) // 管理员管理教师的路由
app.use('/api/admin', adminStudentRouter) // 管理员管理学生的路由

// 配置静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

// 全局错误处理中间件
app.use((err, req, res, next) => {
  // 处理Joi验证错误
  if (err instanceof joi.ValidationError) {
    let message = '';
    // 根据验证失败的字段返回不同的错误信息
    switch (err.details[0].context.key) {
      case 'username':
        message = '姓名必须为2-12位的中文或英文字符';
        break;
      case 'student_id':
        message = '学号必须为8-12位的数字';
        break;
      case 'teacher_id':
        message = '教师工号必须以T开头,后跟7-9位数字';
        break;
      case 'admin_id':
        message = '管理员工号必须以A开头,后跟7-9位数字';
        break;
      case 'password':
        message = '密码必须为6-12位的非空白字符';
        break;
      case 'repassword':
        message = '两次输入的密码不一致';
        break;
      // 新增密码修改相关错误提示
      case 'new_pwd':
        if (err.details[0].type === 'any.invalid') {
          message = '新密码不能与旧密码相同';
        } else {
          message = '新密码必须为6-12位的非空白字符';
        }
        break;
      // 个人信息更新相关错误提示
      case 'name':
        message = '姓名必须为2-12位的中文或英文字符';
        break;
      case 'gender':
        message = '性别只能是男或女';
        break;
      case 'phone':
        message = '手机号必须为1开头的11位数字';
        break;
      case 'email':
        message = '请输入正确的邮箱格式';
        break;
      case 'faculty':
        message = '请输入正确的院系信息';
        break;
      case 'class_name':
        message = '请输入正确的班级信息';
        break;
      case 'title':
        message = '请输入正确的职称信息';
        break;
      default:
        message = err.message;
    }
    return res.cc(message);
  }
  // 处理其他类型的错误
  res.cc(err);
});

// 启动服务器，监听3000端口
app.listen(3000, () => {
  console.log(`http://localhost:3000`);
});
