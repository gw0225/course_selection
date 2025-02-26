// routes/stats.js
const db = require('../../db/index');

// 综合统计接口
exports.getStats = (req, res) => {
  // 并行执行三个查询
  Promise.all([
    // 1. 选课人数前五（支持并列）
    new Promise((resolve, reject) => {
      const sql = `
        WITH RankedCourses AS (
          SELECT 
            c.course_id AS courseId,
            c.course_name AS courseName,
            COUNT(sc.student_id) AS selectedStudents,
            RANK() OVER (ORDER BY COUNT(sc.student_id) DESC) as rnk
          FROM courses c
          LEFT JOIN student_courses sc ON c.course_id = sc.course_id
          GROUP BY c.course_id
        )
        SELECT courseId, courseName, selectedStudents
        FROM RankedCourses
        WHERE rnk <= 5
        ORDER BY selectedStudents DESC`;
      db.query(sql, (err, results) => {
        err ? reject(err) : resolve(results);
      });
    }),

    // 2. 选课人数后五（支持并列）
    new Promise((resolve, reject) => {
      const sql = `
        WITH RankedCourses AS (
          SELECT 
            c.course_id AS courseId,
            c.course_name AS courseName,
            COUNT(sc.student_id) AS selectedStudents,
            RANK() OVER (ORDER BY COUNT(sc.student_id)) as rnk
          FROM courses c
          LEFT JOIN student_courses sc ON c.course_id = sc.course_id
          GROUP BY c.course_id
        )
        SELECT courseId, courseName, selectedStudents
        FROM RankedCourses
        WHERE rnk <= 5
        ORDER BY selectedStudents ASC`;
      db.query(sql, (err, results) => {
        err ? reject(err) : resolve(results);
      });
    }),

    // 3. 汇总统计
    new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          (SELECT COUNT(*) FROM courses) AS totalCourses,
          (SELECT COUNT(DISTINCT student_id) FROM student_courses) AS totalStudents,
          SUM(c.capacity - IFNULL(sc.enrollments, 0)) AS remainingCapacity
        FROM courses c
        LEFT JOIN (
          SELECT course_id, COUNT(student_id) AS enrollments
          FROM student_courses
          GROUP BY course_id
        ) sc ON c.course_id = sc.course_id`;
      db.query(sql, (err, results) => {
        err ? reject(err) : resolve(results[0]);
      });
    })
  ])
  .then(([topCourses, bottomCourses, summary]) => {
    res.send({
      status: 0,
      data: {
        topCourses: formatCourses(topCourses),
        bottomCourses: formatCourses(bottomCourses),
        summary: {
          totalCourses: summary.totalCourses,
          totalStudents: summary.totalStudents,
          remainingCapacity: summary.remainingCapacity
        }
      }
    });
  })
  .catch(err => {
    console.error('统计查询失败:', err);
    res.cc('统计信息获取失败', 1);
  });

  // 格式化课程数据
  function formatCourses(courses) {
    return courses.map(course => ({
      courseId: course.courseId,
      courseName: course.courseName,
      selectedStudents: course.selectedStudents || 0
    }));
  }
};