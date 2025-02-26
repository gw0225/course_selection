// 教师发布与查看已发布课程的接口逻辑

const db = require('../../db/index');

// 获取教师已发布的课程（动态计算已选人数）
exports.getCourses = (req, res) => {
  const teacher_id = req.user.teacher_id; // 从JWT中获取教师ID

  const sql = `
    SELECT 
      c.course_id, 
      c.course_name, 
      c.credits, 
      c.class_hours, 
      c.course_type,
      c.capacity,
      IFNULL(COUNT(sc.student_id), 0) AS selected_students,  -- 动态统计已选人数
      (c.capacity - IFNULL(COUNT(sc.student_id), 0)) AS remaining  -- 实时计算剩余容量
    FROM courses c
    LEFT JOIN student_courses sc ON c.course_id = sc.course_id
    WHERE c.teacher_id = ?
    GROUP BY c.course_id  -- 按课程分组统计
  `;

  db.query(sql, teacher_id, (err, results) => {
    if (err) return res.cc(err);
    res.send({ status: 0, message: '获取成功', data: results });
  });
};

// 创建课程（新增容量字段处理）
exports.createCourse = (req, res) => {
  const teacher_id = req.user.teacher_id;
  const { course_name, credits, class_hours, course_type, capacity = 30 } = req.body;

  // 参数校验（新增容量校验）
  if (!course_name || !credits || !class_hours || !course_type) {
    return res.cc('课程名称、学分、学时、课程类型均为必填项');
  }
  if (isNaN(capacity) || capacity < 1) {
    return res.cc('课程容量必须为大于0的数字');
  }

  // 检查是否已有同名课程
  const checkSql = 'SELECT course_id FROM courses WHERE teacher_id = ? AND course_name = ?';
  
  db.query(checkSql, [teacher_id, course_name], (checkErr, checkResults) => {
    if (checkErr) return res.cc('数据库错误：' + checkErr.message);
    if (checkResults.length > 0) return res.cc('您已发布过同名课程，不可重复创建');

    // 插入课程数据（新增capacity字段）
    const courseData = {
      course_name,
      teacher_id,
      credits,
      class_hours,
      course_type,
      capacity: Number(capacity)  // 确保数值类型
    };

    const insertSql = 'INSERT INTO courses SET ?';
    
    db.query(insertSql, courseData, (insertErr, insertResults) => {
      if (insertErr) return res.cc('数据库错误：' + insertErr.message);
      if (insertResults.affectedRows !== 1) return res.cc('发布课程失败');
      res.cc('课程发布成功', 0);
    });
  });
};

// 更新课程信息（动态校验容量合法性）
exports.updateCourse = (req, res) => {
  const teacher_id = req.user.teacher_id;
  const course_id = req.params.course_id;
  const { course_name, credits, class_hours, course_type, capacity } = req.body;

  // 参数校验
  if (!course_name || !credits || !class_hours || !course_type || !capacity) {
    return res.cc('所有字段均为必填项');
  }
  if (isNaN(credits) || isNaN(class_hours) || isNaN(capacity)) {
    return res.cc('学分、学时、容量必须为数字');
  }
  if (capacity < 1) return res.cc('课程容量必须大于0');

  // 先动态获取当前已选人数
  const checkSql = `
    SELECT COUNT(student_id) AS selected_students 
    FROM student_courses 
    WHERE course_id = ?
  `;
  db.query(checkSql, [course_id], (checkErr, checkResults) => {
    if (checkErr) return res.cc('数据库错误：' + checkErr.message);
    
    // 检查容量是否合法
    const currentSelected = checkResults[0].selected_students;
    if (Number(capacity) < currentSelected) {
      return res.cc(`新容量不能小于当前已选人数(${currentSelected}人)`);
    }

    // 执行更新操作
    const updateSql = `
      UPDATE courses 
      SET 
        course_name = ?,
        credits = ?,
        class_hours = ?,
        course_type = ?,
        capacity = ?
      WHERE 
        course_id = ? 
        AND teacher_id = ?
    `;

    const params = [
      course_name,
      Number(credits),
      Number(class_hours),
      course_type,
      Number(capacity),
      course_id,
      teacher_id
    ];
    
    db.query(updateSql, params, (updateErr, updateResults) => {
      if (updateErr) return res.cc('数据库错误：' + updateErr.message);
      if (updateResults.affectedRows === 0) return res.cc('更新失败');
      res.cc('课程更新成功', 0);
    });
  });
};

// 删除课程（保持不变）
exports.deleteCourse = (req, res) => {
  const teacher_id = req.user.teacher_id;
  const course_id = req.params.course_id;

  const sql = 'DELETE FROM courses WHERE course_id = ? AND teacher_id = ?';
  
  db.query(sql, [course_id, teacher_id], (err, results) => {
    if (err) return res.cc('数据库错误：' + err.message);
    if (results.affectedRows === 0) return res.cc('课程不存在或无权删除');
    res.cc('课程删除成功', 0);
  });
};