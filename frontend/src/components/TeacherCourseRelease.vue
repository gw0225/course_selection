<template>
  <div class="course-release-container">
    <!-- 课程信息编辑模块 -->
    <div class="edit-section card-style">
      <h1 class="section-title">课程信息编辑</h1>
      <form @submit.prevent="submitCourse" class="course-form">
        <!-- 课程名称 -->
        <div class="form-group">
          <label>课程名称：</label>
          <input
            type="text"
            v-model="form.courseName"
            required
            placeholder="请输入课程名称"
            class="form-input"
          />
        </div>

        <!-- 课程类别 -->
        <div class="form-group">
          <label>课程类别：</label>
          <select v-model="form.courseType" required class="form-select">
            <option value="">请选择类别</option>
            <option value="必修课">必修课</option>
            <option value="选修课">选修课</option>
            <option value="公共课">公共课</option>
          </select>
        </div>

        <!-- 学分 -->
        <div class="form-group">
          <label>学分：</label>
          <input
            type="number"
            v-model.number="form.credits"
            required
            min="1"
            max="10"
            placeholder="1-10"
            class="form-input"
          />
        </div>

        <!-- 学时 -->
        <div class="form-group">
          <label>学时：</label>
          <input
            type="number"
            v-model.number="form.classHours"
            required
            min="0"
            max="100"
            class="form-input"
          />
        </div>

        <!-- 课程容量 -->
        <div class="form-group">
          <label>课程容量：</label>
          <input
            type="number"
            v-model.number="form.capacity"
            required
            min="1"
            placeholder="请输入课程容量"
            class="form-input"
          />
        </div>

        <!-- 发布课程按钮 -->
        <div class="form-submit">
          <button type="submit" class="submit-btn">
            {{ editingCourse ? '更新课程' : '发布课程' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 已发布课程模块 -->
    <div class="published-section card-style">
      <h1 class="section-title">已发布课程</h1>
      <div v-if="courses.length === 0" class="empty-tip">
        📚 暂无已发布课程
      </div>

      <div v-else class="course-list-container">
        <table class="courses-table">
          <thead>
            <tr>
              <th>课程ID</th>
              <th>课程名称</th>
              <th>学分</th>
              <th>学时</th>
              <th>课程类别</th>
              <th>容量</th>
              <th>已选人数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in courses" :key="course.course_id">
              <td>{{ course.course_id }}</td>
              <td>{{ course.course_name }}</td>
              <td>{{ course.credits }}</td>
              <td>{{ course.class_hours }}</td>
              <td>{{ course.course_type || '-' }}</td>
              <td>{{ course.capacity }}</td>
              <td>{{ course.selected_students }}</td>
              <td class="action-cells">
                <button @click="editCourse(course)" class="edit-btn">编辑</button>
                <button @click="deleteCourse(course.course_id)" class="delete-btn">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TeacherCourseRelease",
  data() {
    return {
      form: {
        courseName: "",
        credits: null,
        classHours: 0,
        courseType: "",
        capacity: 30, // 默认容量为30
        courseId: null,
      },
      courses: [],
      editingCourse: false,
    };
  },
  methods: {
    fetchCourses() {
      axios
        .get("/api/teacher/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          if (response.data.status === 0) {
            this.courses = response.data.data;
          } else {
            alert("获取课程失败: " + response.data.message);
          }
        })
        .catch((error) => {
          alert("请求错误: " + (error.response?.data?.message || error.message));
        });
    },

    submitCourse() {
      const payload = {
        course_name: this.form.courseName,
        credits: this.form.credits,
        class_hours: this.form.classHours,
        course_type: this.form.courseType,
        capacity: this.form.capacity, // 新增容量字段
      };

      const request = this.editingCourse
        ? axios.put(`/api/teacher/courses/${this.form.courseId}`, payload, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          })
        : axios.post("/api/teacher/courses", payload, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

      request
        .then((response) => {
          if (response.data.status !== 0) {
            return alert(
              (this.editingCourse ? "更新" : "发布") + "失败: " + response.data.message
            );
          }
          this.resetForm();
          this.fetchCourses();
          alert(this.editingCourse ? "课程更新成功" : "课程发布成功");
        })
        .catch((error) => {
          alert("操作失败: " + (error.response?.data?.message || error.message));
        });
    },

    editCourse(course) {
      this.form = {
        courseName: course.course_name,
        credits: course.credits,
        classHours: course.class_hours,
        courseType: course.course_type,
        capacity: course.capacity, // 编辑时填充容量字段
        courseId: course.course_id,
      };
      this.editingCourse = true;
    },

    deleteCourse(courseId) {
      if (!confirm("确定要删除该课程吗？")) return;

      axios
        .delete(`/api/teacher/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          if (response.data.status !== 0) {
            return alert("删除失败: " + response.data.message);
          }
          this.fetchCourses();
          alert("课程删除成功");
        })
        .catch((error) => {
          alert("删除失败: " + (error.response?.data?.message || error.message));
        });
    },

    resetForm() {
      this.form = {
        courseName: "",
        credits: null,
        classHours: 0,
        courseType: "",
        capacity: 30, // 重置为默认容量
        courseId: null,
      };
      this.editingCourse = false;
    },
  },
  mounted() {
    this.fetchCourses();
  },
};
</script>

<style scoped>
.course-release-container {
  display: grid;
  gap: 16px;
  padding: 0px;
  background-color: #f4f7fa;
}

.card-style {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 0;
}

.section-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #42b983;
}

.course-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-input,
.form-select {
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  width: 100%;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus {
  border-color: #42b983;
  outline: none;
}

.form-submit {
  text-align: center;
  margin-top: 16px;
}

.submit-btn {
  width: 200px;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover {
  background-color: #369f6e;
}

.course-list-container {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  margin: 0 auto;
}

.courses-table th,
.courses-table td {
  padding: 8px 12px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.courses-table th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 500;
}

.action-cells {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.edit-btn {
  background-color: #42b983;
  color: white;
}

.edit-btn:hover {
  background-color: #369f6e;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #d32f2f;
}

.empty-tip {
  text-align: center;
  padding: 24px 0;
  color: #6c757d;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .form-group {
    padding: 0;
    margin: 0 4px;
  }

  .form-input,
  .form-select {
    width: 100%;
    margin: 0;
  }
}
</style>