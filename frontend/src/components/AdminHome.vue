<template>
  <div class="admin-home">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <!-- 个人信息区域 -->
      <div class="profile">
        <!-- 管理员信息 -->
        <div class="admin-info">
          <div class="greeting">
            <span class="username">{{ adminInfo.name }}</span>管理员，欢迎登录！
          </div>
          <!-- 非编辑模式 -->
          <template v-if="!isEditing">
            <div class="info-item">
              <span class="info-label">工号：</span>
              <span class="info-value">{{ adminInfo.adminId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <span class="info-value">{{ adminInfo.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">电话：</span>
              <span class="info-value">{{ adminInfo.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邮箱：</span>
              <span class="info-value">{{ adminInfo.email }}</span>
            </div>
            <button class="edit-button" @click="startEdit">编辑个人信息</button>
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <div class="info-item">
              <span class="info-label">工号：</span>
              <span class="info-value">{{ adminInfo.adminId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">姓名：</span>
              <input v-model="editInfo.name" class="info-input" type="text">
            </div>
            <div class="info-item">
              <span class="info-label">电话：</span>
              <input v-model="editInfo.phone" class="info-input" type="text">
            </div>
            <div class="info-item">
              <span class="info-label">邮箱：</span>
              <input v-model="editInfo.email" class="info-input" type="text">
            </div>
            <div class="button-group">
              <button class="save-button" @click="saveInfo">保存</button>
              <button class="cancel-button" @click="cancelEdit">取消</button>
            </div>
          </template>
        </div>
      </div>

      <ul class="menu">
        <li :class="{ active: currentView === 'stats' }" @click="currentView = 'stats'">数据统计</li>
        <li :class="{ active: currentView === 'teachers' }" @click="currentView = 'teachers'">教师管理</li>
        <li :class="{ active: currentView === 'students' }" @click="currentView = 'students'">学生管理</li>
      </ul>
    </div>

    <!-- 右侧内容 -->
    <div class="main-content">
      <div class="logout-button" @click="handleLogout">登出</div>

      <!-- 数据统计视图 -->
      <div v-if="currentView === 'stats'" class="content-section">
        <div class="course-browse">
          <h1 class="section-title">数据统计</h1>
          
          <!-- 总体统计卡片 -->
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-content">
                <div class="stat-value">{{ summary.totalCourses }}</div>
                <div class="stat-label">总课程数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-value">{{ summary.totalStudents }}</div>
                <div class="stat-label">选课学生数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💺</div>
              <div class="stat-content">
                <div class="stat-value">{{ summary.remainingCapacity }}</div>
                <div class="stat-label">剩余容量</div>
              </div>
            </div>
          </div>

          <!-- 选课排名图表 -->
          <div class="course-list-container">
            <!-- 选课人数最多的课程 -->
            <div class="chart-section">
              <h3>选课人数前五课程</h3>
              <div class="course-list">
                <div v-for="course in topCourses" :key="course.courseId" class="course-item">
                  <div class="course-info">
                    <span class="course-name">{{ course.courseName }}</span>
                    <span class="course-value">{{ course.selectedStudents }}人</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress" 
                      :style="{ width: `${(course.selectedStudents / maxStudents) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 选课人数最少的课程 -->
            <div class="chart-section">
              <h3>选课人数后五课程</h3>
              <div class="course-list">
                <div v-for="course in bottomCourses" :key="course.courseId" class="course-item">
                  <div class="course-info">
                    <span class="course-name">{{ course.courseName }}</span>
                    <span class="course-value">{{ course.selectedStudents }}人</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress warning" 
                      :style="{ width: `${(course.selectedStudents / maxStudents) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教师管理视图 -->
      <div v-if="currentView === 'teachers'" class="content-section">
        <div class="course-browse">
          <h1 class="section-title">教师管理</h1>
          <!-- 这里添加教师管理的内容 -->
        </div>
      </div>

      <!-- 学生管理视图 -->
      <div v-if="currentView === 'students'" class="content-section">
        <div class="course-browse">
          <h1 class="section-title">学生管理</h1>
          <!-- 这里添加学生管理的内容 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "AdminHome",
  data() {
    return {
      currentView: 'stats',
      adminInfo: {
        adminId: '',
        name: '系统',
        phone: '',
        email: ''
      },
      summary: {
        totalCourses: 0,
        totalStudents: 0,
        remainingCapacity: 0
      },
      topCourses: [],
      bottomCourses: [],
      isEditing: false,
      editInfo: {
        name: '',
        phone: '',
        email: ''
      }
    };
  },
  computed: {
    maxStudents() {
      return Math.max(
        ...this.topCourses.map(course => course.selectedStudents),
        ...this.bottomCourses.map(course => course.selectedStudents)
      );
    }
  },
  mounted() {
    this.fetchStats();
    this.fetchAdminInfo();
  },
  methods: {
    fetchStats() {
      axios.get('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (response.data.status === 0) {
          const { summary, topCourses, bottomCourses } = response.data.data;
          this.summary = summary;
          this.topCourses = topCourses;
          this.bottomCourses = bottomCourses;
        }
      })
      .catch(error => {
        console.error('获取统计数据失败:', error);
      });
    },
    fetchAdminInfo() {
      axios.get('/api/admin/info', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (response.data.status === 0) {
          const data = response.data.data;
          this.adminInfo = {
            adminId: data.admin_id,
            name: data.name,
            phone: data.phone || '暂无',
            email: data.email || '暂无'
          };
        }
      })
      .catch(error => {
        console.error('获取管理员信息失败:', error);
      });
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    startEdit() {
      this.editInfo = {
        name: this.adminInfo.name,
        phone: this.adminInfo.phone,
        email: this.adminInfo.email
      }
      this.isEditing = true
    },
    cancelEdit() {
      this.isEditing = false
    },
    saveInfo() {
      axios.post('/api/admin/update', this.editInfo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (response.data.status === 0) {
          alert('个人信息更新成功！')
          this.isEditing = false
          this.fetchAdminInfo() // 重新获取信息
        } else {
          alert(response.data.message)
        }
      })
    }
  }
};
</script>

<style scoped>
/* 统一教师端样式 */
.admin-home {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background-color: #2f3e46;
  color: white;
  padding-top: 20px;
}

.profile {
  padding: 15px;
  margin-bottom: 20px;
}

.greeting {
  font-size: 14px;
  color: #eee;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.username {
  color: #42b983;
  font-weight: 600;
  margin-right: 4px;
}

.admin-info {
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 15px;
}

.info-item {
  margin: 8px 0;
  font-size: 13px;
  color: #eee;
  display: flex;
  align-items: center;
}

.info-label {
  color: #aaa;
  width: 45px;
  flex-shrink: 0;
}

.info-value {
  color: #fff;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu {
  list-style: none;
  padding: 0;
}

.menu li {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #444;
  cursor: pointer;
}

.menu li:hover {
  background-color: #1d272d;
}

.menu li.active {
  background-color: #42b983;
}

.main-content {
  flex-grow: 1;
  padding: 24px;
  background-color: #f4f7fa;
  position: relative;
}

.logout-button {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.logout-button:hover {
  background-color: #d32f2f;
}

.course-browse {
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
  margin-top: 20px;
}

/* 保留原有的统计相关样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-right: 16px;
  color: #42b983;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.data-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-name {
  color: #2c3e50;
  font-weight: 500;
}

.course-value {
  color: #6c757d;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #42b983;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress.warning {
  background: #ffc107;
}

.info-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  font-size: 13px;
  width: 120px;
}

.info-input:focus {
  outline: none;
  border-color: #42b983;
}

.edit-button, .save-button, .cancel-button {
  width: 100%;
  padding: 6px;
  margin-top: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.edit-button {
  background: #42b983;
  color: white;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.save-button {
  flex: 1;
  background: #42b983;
  color: white;
}

.cancel-button {
  flex: 1;
  background: #6c757d;
  color: white;
}

.edit-button:hover, .save-button:hover {
  background: #3aa876;
}

.cancel-button:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .profile {
    padding: 10px 5px;
  }

  .greeting {
    display: none;
  }

  .admin-info {
    display: none;
  }

  .menu li {
    padding: 12px;
    text-align: center;
  }

  .main-content {
    margin-left: 60px;
  }
}
</style>