<template>
  <div class="student-selected">
    <h1 class="section-title">已选课程</h1>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">加载失败：{{ error }}</div>
    <div v-else>
      <div v-if="selectedCourses.length > 0" class="course-list-container">
        <ul class="course-list">
          <li 
            v-for="course in selectedCourses" 
            :key="course.course_id" 
            class="course-item"
          >
            <div class="course-info">
              <h3>{{ course.course_name }}</h3>
              <p>课程编号：{{ course.course_id }}</p>
              <p>教师：{{ course.teacher.name || '未分配' }}</p>
              <p>学院：{{ course.teacher.department || '未知学院' }}</p>
              <p>学分：{{ course.credits }}</p>
              <p>学时：{{ course.class_hours }}</p>
              <p>类型：{{ course.course_type || '未分类' }}</p>
            </div>
            <button 
              class="unselect-button"
              @click="handleUnselect(course.course_id)"
            >
              退选
            </button>
          </li>
        </ul>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <p class="empty-text">当前没有已选课程</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'StudentSelected',
  data() {
    return {
      selectedCourses: [],
      loading: true,
      error: null
    }
  },
  mounted() {
    this.fetchSelectedCourses();
  },
  methods: {
    fetchSelectedCourses() {
      axios.get('/api/student/selected-courses', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (response.data.status === 0) {
          this.selectedCourses = response.data.data.list;
        } else {
          this.error = response.data.message || '数据加载失败';
        }
        this.loading = false;
      })
      .catch(err => {
        console.error('获取已选课程失败:', err);
        this.error = err.response?.data?.message || '网络请求失败';
        this.loading = false;
      });
    },
    handleUnselect(courseId) {
      axios.delete('/api/student/drop-course', {
        data: { course_id: courseId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (response.data.status === 0) {
          this.selectedCourses = this.selectedCourses.filter(
            course => course.course_id !== courseId
          );
          alert('退选成功');
        } else {
          alert(response.data.message || '退选失败');
        }
      })
      .catch(err => {
        console.error('退选失败:', err);
        alert(err.response?.data?.message || '退选操作失败');
      });
    }
  }
}
</script>

<style scoped>
.student-selected {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #42b983;
}

.course-list-container {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
}

.course-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-item {
  background-color: white;
  border-radius: 4px;
  padding: 15px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
}

.course-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.course-info h3 {
  margin-top: 0;
  color: #2c3e50;
}

.course-info p {
  margin: 5px 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.unselect-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
}

.unselect-button:hover {
  background-color: #d32f2f;
}

.loading,
.error {
  text-align: center;
  padding: 40px 0;
  color: #666;
}

.error {
  color: #ff4444;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.6;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6c757d;
  font-size: 1.1rem;
}
</style>