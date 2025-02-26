const db = require('../../db/index');

// 获取已选课程
exports.getSelectedCourses = (req, res) => {
  const student_id = req.user.student_id;

  const sql = `
    SELECT 
      c.course_id,
      c.course_name,
      c.credits,
      c.class_hours,
      c.course_type,
      t.teacher_id,
      t.name AS teacher_name,
      t.title,
      t.department
    FROM student_courses sc
    INNER JOIN courses c ON sc.course_id = c.course_id
    LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
    WHERE sc.student_id = ?
  `;

  db.query(sql, [student_id], (err, results) => {
    if (err) return res.cc('数据查询失败', 1);
    
    res.send({
      status: 0,
      data: {
        total: results.length,
        list: results.map(item => ({
          course_id: item.course_id,
          course_name: item.course_name,
          credits: item.credits,
          class_hours: item.class_hours,
          course_type: item.course_type,
          teacher: {
            teacher_id: item.teacher_id,
            name: item.teacher_name || '未分配',
            title: item.title || '',
            department: item.department || '未知院系'
          }
        }))
      }
    });
  });
};


// 选课功能（新增返回剩余容量）
exports.selectCourse = (req, res) => {
  const { course_id } = req.body;
  const student_id = req.user.student_id;

  // 验证课程有效性并获取容量信息
  const courseCheck = `
    SELECT 
      c.capacity,
      COUNT(sc.student_id) AS selected_students
    FROM courses c
    LEFT JOIN student_courses sc ON c.course_id = sc.course_id
    WHERE c.course_id = ?
    GROUP BY c.course_id
  `;
  
  db.query(courseCheck, [course_id], (err, courseResults) => {
    if (err) return res.cc('数据库错误');
    if (courseResults.length === 0) return res.cc('课程不存在');
    
    const { capacity, selected_students } = courseResults[0];
    if (selected_students >= capacity) return res.cc('课程已满');

    // 检查重复选课
    const duplicateCheck = 'SELECT * FROM student_courses WHERE student_id = ? AND course_id = ?';
    db.query(duplicateCheck, [student_id, course_id], (err, duplicateResults) => {
      if (err) return res.cc('数据库错误');
      if (duplicateResults.length > 0) return res.cc('不可重复选课');

      // 执行选课操作
      const insertSql = 'INSERT INTO student_courses (student_id, course_id) VALUES (?, ?)';
      db.query(insertSql, [student_id, course_id], (err, insertResults) => {
        if (err) return res.cc('选课失败');
        
        // 获取最新剩余容量
        const remaining = capacity - (selected_students + 1);
        res.send({
          status: 0,
          message: '选课成功',
          data: {
            course_id,
            remaining_capacity: remaining  // 返回最新剩余容量
          }
        });
      });
    });
  });
};

// 退选功能（新增返回剩余容量）
exports.dropCourse = (req, res) => {
  const { course_id } = req.body;
  const student_id = req.user.student_id;

  // 获取当前选课状态
  const checkSql = `
    SELECT 
      c.capacity,
      COUNT(sc.student_id) AS selected_students
    FROM courses c
    LEFT JOIN student_courses sc ON c.course_id = sc.course_id
    WHERE c.course_id = ?
    GROUP BY c.course_id
  `;

  db.query(checkSql, [course_id], (err, checkResults) => {
    if (err) return res.cc('数据库错误');
    if (checkResults.length === 0) return res.cc('课程不存在');

    // 验证选课记录
    const enrollCheck = 'SELECT * FROM student_courses WHERE student_id = ? AND course_id = ?';
    db.query(enrollCheck, [student_id, course_id], (err, enrollResults) => {
      if (err) return res.cc('数据库错误');
      if (enrollResults.length === 0) return res.cc('未找到选课记录');

      // 执行退选
      const deleteSql = 'DELETE FROM student_courses WHERE student_id = ? AND course_id = ?';
      db.query(deleteSql, [student_id, course_id], (err, deleteResults) => {
        if (err) return res.cc('退选失败');

        // 计算最新剩余容量
        const { capacity, selected_students } = checkResults[0];
        const remaining = capacity - (selected_students - 1);
        res.send({
          status: 0,
          message: '退选成功',
          data: {
            course_id,
            remaining_capacity: remaining  // 返回最新剩余容量
          }
        });
      });
    });
  });
};
