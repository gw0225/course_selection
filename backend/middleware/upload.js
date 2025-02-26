// 导入multer模块，用于处理文件上传
const multer = require('multer');
// 导入路径处理模块
const path = require('path');

/**
 * 配置multer存储引擎
 * 用于处理文件上传的存储位置和文件名
 */
const storage = multer.diskStorage({
  // 设置文件存储目录
  destination: path.join(__dirname, '../public/avatar'),

  // 设置文件名
  filename: (req, file, cb) => {
    // 检查用户是否已认证
    if (!req.user) {
      return cb(new Error('User not authenticated'));
    }
    // 使用源文件名，保留原文件扩展名
    cb(null, file.originalname);
  }
});

// 创建multer上传实例
const upload = multer({
  storage: storage // 使用配置好的存储引擎
});

// 导出上传中间件
module.exports = upload;

