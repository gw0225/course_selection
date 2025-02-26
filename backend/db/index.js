// 引入mysql2数据库模块
const mysql = require('mysql2');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'course_selection_db'
});

// 测试数据库连接
pool.query('SELECT 1', (err, results) => {
  if (err) {
    console.error('❌ 数据库连接失败：', err.message);
  } else {
    console.log('✅ 数据库连接成功！');
  }
});

module.exports = pool;
