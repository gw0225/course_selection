// 学生获取课程信息接口逻辑

const db = require('../../db/index');

/**
 * 获取课程列表逻辑（新增容量相关字段）
 */
exports.getCourses = (req, res) => {
  const student_id = req.user.student_id;

  const sql = `
    SELECT 
      c.course_id AS courseId,
      c.course_name AS courseName,
      c.credits,
      c.class_hours AS classHours,
      c.course_type AS courseType,
      c.capacity,  -- 新增容量字段
      COUNT(sc.student_id) AS selected_students,  -- 动态计算已选人数
      (c.capacity - COUNT(sc.student_id)) AS remaining,  -- 计算剩余容量
      t.name AS teacherName,
      t.title AS teacherTitle,
      t.department AS teacherDepartment,
      EXISTS(
        SELECT 1 FROM student_courses sc 
        WHERE sc.student_id = ? AND sc.course_id = c.course_id
      ) AS isSelected
    FROM courses c
    LEFT JOIN student_courses sc ON c.course_id = sc.course_id
    LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
    GROUP BY c.course_id  -- 按课程分组统计
    ORDER BY c.course_id DESC
  `;

  db.query(sql, [student_id], (err, results) => {
    if (err) return res.cc('课程加载失败', 1);

    const formattedCourses = results.map(course => ({
      courseId: course.courseId,
      courseName: course.courseName,
      credits: course.credits,
      classHours: course.classHours,
      courseType: course.courseType || '未分类',
      capacity: course.capacity,          // 课程总容量
      selected: course.selected_students, // 已选人数
      remaining: course.remaining,        // 剩余容量
      isSelected: Boolean(course.isSelected),
      teacher: {
        name: course.teacherName || '暂未分配教师',
        title: course.teacherTitle || '',
        department: course.teacherDepartment || '未知院系'
      }
    }));

    res.send({
      status: 0,
      message: '课程数据获取成功',
      data: {
        total: formattedCourses.length,
        list: formattedCourses
      }
    });
  });
};