//导入数据库
const db = require('../../db/index');

/**
 * 获取选课学生信息的接口逻辑
 * 路由处理函数，接收请求对象和响应对象
 */
exports.getSelectedStudents = (req, res) => {
  // 从认证信息中获取当前教师的ID
  const teacher_id = req.user.teacher_id;

  /**
   * 第一步：构建查询语句
   * 查询当前教师所教授课程的学生信息，包括学生基本信息和所选课程
   */
  const baseQuery = `
    SELECT 
      s.student_id,          -- 学生ID
      s.name,                -- 学生姓名
      s.gender,              -- 学生性别
      s.faculty,             -- 学生所属院系
      s.class_name,          -- 学生班级名称
      s.phone,               -- 学生电话
      s.email,               -- 学生邮箱
      GROUP_CONCAT(DISTINCT c.course_id) AS course_ids,    -- 学生所选课程ID列表,使用GROUP_CONCAT聚合
      GROUP_CONCAT(DISTINCT c.course_name) AS course_names -- 学生所选课程名称列表,使用GROUP_CONCAT聚合
    FROM students s
    INNER JOIN student_courses sc ON s.student_id = sc.student_id  -- 连接学生表和选课表
    INNER JOIN courses c ON sc.course_id = c.course_id             -- 连接选课表和课程表
    WHERE c.teacher_id = ?  -- 只过滤当前教师的课程
    GROUP BY s.student_id   -- 按学生ID分组,以便聚合每个学生的选课信息
  `;

  // 定义查询参数，当前教师的ID
  const queryParams = [teacher_id];

  /**
   * 第二步：执行数据库查询
   * 查询当前教师所教授课程的学生信息
   */
  db.query(baseQuery, queryParams, (err, results) => {
    if (err) return res.cc('数据库查询失败', 1);  // 如果查询出错，返回错误信息
    
    /**
     * 第三步：处理查询结果
     * 将课程ID和课程名称拆分为数组，并构造返回的数据结构
     */
    const processed = results.map(item => ({
      student_id: item.student_id,  // 学生ID
      name: item.name,              // 学生姓名
      gender: item.gender,          // 学生性别
      faculty: item.faculty,        // 学生所属院系
      class_name: item.class_name,  // 学生班级名称
      contact: {
        phone: item.phone,          // 学生电话
        email: item.email           // 学生邮箱
      },
      selected_courses: item.course_ids.split(',').map((id, index) => ({
        course_id: parseInt(id),  // 课程ID，转换为整数
        course_name: item.course_names.split(',')[index]  // 课程名称，根据索引匹配
      }))
    }));

    /**
     * 第四步：返回成功响应
     * 包含处理后的学生信息和总数
     */
    res.send({
      status: 0,
      data: {
        total: processed.length,  // 学生总数
        students: processed       // 学生列表
      }
    });
  });
};


/**
 * 强制退选学生的接口逻辑
 * 路由处理函数，接收请求对象和响应对象
 */
exports.deselectStudent = (req, res) => {
    // 从请求体中获取学生ID和课程ID
    const { student_id, course_id } = req.body;
    // 从认证信息中获取教师ID
    const teacher_id = req.user.teacher_id;
  
    /**
     * 第一步：验证课程归属
     * 确认要操作的课程属于当前教师，防止越权操作
     */
    const verifyQuery = `
      SELECT course_id FROM courses 
      WHERE course_id = ? AND teacher_id = ?
    `;
  
    db.query(verifyQuery, [course_id, teacher_id], (verifyErr, verifyResults) => {
      if (verifyErr) return res.cc('数据库验证失败', 1);  // 数据库错误
      if (verifyResults.length === 0) return res.cc('无权操作该课程', 1);  // 无匹配课程
  
      /**
       * 第二步：执行退选操作
       * 从student_courses表中删除对应记录
       */
      const deleteQuery = `
        DELETE FROM student_courses 
        WHERE student_id = ? AND course_id = ?
      `;
  
      db.query(deleteQuery, [student_id, course_id], (deleteErr, deleteResults) => {
        if (deleteErr) return res.cc('退选操作失败', 1);  // 数据库错误
        if (deleteResults.affectedRows === 0) return res.cc('学生未选择该课程', 1);  // 无影响行数
  
        /**
         * 第三步：检查剩余课程
         * 确认学生是否还有其他本教师的课程，用于前端提示
         */
        const checkQuery = `
          SELECT COUNT(*) AS remaining 
          FROM student_courses sc
          JOIN courses c ON sc.course_id = c.course_id
          WHERE sc.student_id = ? AND c.teacher_id = ?
        `;
  
        db.query(checkQuery, [student_id, teacher_id], (checkErr, checkResults) => {
          if (checkErr) return res.cc('课程状态检查失败', 1);
          
          // 返回成功响应，包含是否完全移除的标识
          res.send({
            status: 0,
            message: '退选成功',
            data: {
              completely_removed: checkResults[0].remaining === 0  // 剩余课程数为0时返回true
            }
          });
        });
      });
    });
  };