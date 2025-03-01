<template>
  <div class="admin-home">
    <!-- 整个管理主页的容器，使用 flex 布局 -->
    <div class="sidebar">
      <!-- 左侧导航栏 -->
      <div class="profile">
        <!-- 个人信息区域 -->
        <div class="admin-info">
          <!-- 管理员信息 -->
          <div class="greeting">
            <!-- 欢迎信息 -->
            <span class="username">{{ adminInfo.name }}</span>管理员，欢迎登录！
            <!-- 显示管理员姓名，并显示欢迎信息 -->
          </div>
          <!-- 非编辑模式 -->
          <template v-if="!isEditing">
            <!-- 如果不是编辑模式，则显示只读的管理员信息 -->
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">工号：</span>
              <!-- 工号标签 -->
              <div class="info-content scrollable">{{ adminInfo.adminId }}</div>
              <!-- 工号内容，可滚动 -->
            </div>
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">姓名：</span>
              <!-- 姓名标签 -->
              <div class="info-content scrollable">{{ adminInfo.name }}</div>
              <!-- 姓名内容，可滚动 -->
            </div>
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">电话：</span>
              <!-- 电话标签 -->
              <div class="info-content scrollable">{{ adminInfo.phone }}</div>
              <!-- 电话内容，可滚动 -->
            </div>
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">邮箱：</span>
              <!-- 邮箱标签 -->
              <div class="info-content scrollable">{{ adminInfo.email }}</div>
              <!-- 邮箱内容，可滚动 -->
            </div>
            <button class="edit-button" @click="startEdit">编辑个人信息</button>
            <!-- 编辑个人信息按钮，点击时触发 startEdit 方法 -->
          </template>
          <!-- 编辑模式 -->
          <template v-else>
            <!-- 如果是编辑模式，则显示可编辑的管理员信息 -->
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">工号：</span>
              <!-- 工号标签 -->
              <div class="info-content scrollable">{{ adminInfo.adminId }}</div>
              <!-- 工号内容，可滚动，只读 -->
            </div>
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">姓名：</span>
              <!-- 姓名标签 -->
              <input v-model="editInfo.name" class="info-input" type="text">
              <!-- 姓名输入框，双向绑定 editInfo.name -->
            </div>
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">电话：</span>
              <!-- 电话标签 -->
              <input v-model="editInfo.phone" class="info-input" type="text">
              <!-- 电话输入框，双向绑定 editInfo.phone -->
            </div>
            <div class="info-row">
              <!-- 一行信息，包含标签和内容 -->
              <span class="info-label">邮箱：</span>
              <!-- 邮箱标签 -->
              <input v-model="editInfo.email" class="info-input" type="text">
              <!-- 邮箱输入框，双向绑定 editInfo.email -->
            </div>
            <div class="action-buttons">
              <!-- 操作按钮区域 -->
              <button class="save-button" @click="saveInfo">保存</button>
              <!-- 保存按钮，点击时触发 saveInfo 方法 -->
              <button class="cancel-button" @click="cancelEdit">取消</button>
              <!-- 取消按钮，点击时触发 cancelEdit 方法 -->
            </div>
          </template>
        </div>
      </div>

      <ul class="menu">
        <!-- 导航菜单 -->
        <li :class="{ active: activeTab === 'stats' }" @click="switchTab('stats')">数据统计</li>
        <!-- 数据统计菜单项，点击时触发 switchTab 方法，并传递 'stats' 参数，根据 activeTab 决定是否激活 -->
        <li :class="{ active: activeTab === 'teachers' }" @click="switchTab('teachers')">教师管理</li>
        <!-- 教师管理菜单项，点击时触发 switchTab 方法，并传递 'teachers' 参数，根据 activeTab 决定是否激活 -->
        <li :class="{ active: activeTab === 'students' }" @click="switchTab('students')">学生管理</li>
        <!-- 学生管理菜单项，点击时触发 switchTab 方法，并传递 'students' 参数，根据 activeTab 决定是否激活 -->
      </ul>
    </div>

    <!-- 右侧内容 -->
    <div class="main-content">
      <!-- 主要内容区域 -->
      <div class="logout-button" @click="handleLogout">登出</div>
      <!-- 登出按钮，点击时触发 handleLogout 方法 -->

      <!-- 数据统计区域 -->
      <div v-if="activeTab === 'stats'" class="info-section">
        <!-- 如果 activeTab 为 'stats'，则显示数据统计区域 -->
        <div class="course-browse">
          <!-- 课程浏览区域 -->
          <h1 class="section-title">数据统计</h1>
          <!-- 标题 -->

          <!-- 总体统计卡片 -->
          <div class="stats-cards">
            <!-- 统计卡片容器 -->
            <div class="stat-card">
              <!-- 单个统计卡片 -->
              <div class="stat-icon">📚</div>
              <!-- 图标 -->
              <div class="stat-content">
                <!-- 内容区域 -->
                <div class="stat-value">{{ summary.totalCourses }}</div>
                <!-- 总课程数 -->
                <div class="stat-label">总课程数</div>
                <!-- 标签 -->
              </div>
            </div>
            <div class="stat-card">
              <!-- 单个统计卡片 -->
              <div class="stat-icon">👥</div>
              <!-- 图标 -->
              <div class="stat-content">
                <!-- 内容区域 -->
                <div class="stat-value">{{ summary.totalStudents }}</div>
                <!-- 选课学生数 -->
                <div class="stat-label">选课学生数</div>
                <!-- 标签 -->
              </div>
            </div>
            <div class="stat-card">
              <!-- 单个统计卡片 -->
              <div class="stat-icon">💺</div>
              <!-- 图标 -->
              <div class="stat-content">
                <!-- 内容区域 -->
                <div class="stat-value">{{ summary.remainingCapacity }}</div>
                <!-- 剩余容量 -->
                <div class="stat-label">剩余容量</div>
                <!-- 标签 -->
              </div>
            </div>
          </div>

          <!-- 选课排名图表 -->
          <div class="course-list-container">
            <!-- 选课排名图表容器 -->
            <!-- 选课人数最多的课程 -->
            <div class="chart-section">
              <!-- 图表区域 -->
              <h3>选课人数前五课程</h3>
              <!-- 标题 -->
              <div class="course-list">
                <!-- 课程列表 -->
                <div v-for="course in topCourses" :key="course.courseId" class="course-item">
                  <!-- 循环渲染课程列表，key 为 course.courseId -->
                  <div class="course-info">
                    <!-- 课程信息 -->
                    <span class="course-name">{{ course.courseName }}</span>
                    <!-- 课程名称 -->
                    <span class="course-value">{{ course.selectedStudents }}人</span>
                    <!-- 选课人数 -->
                  </div>
                  <div class="progress-bar">
                    <!-- 进度条 -->
                    <div
                      class="progress"
                      :style="{ width: `${(course.selectedStudents / maxStudents) * 100}%` }"
                    ></div>
                    <!-- 进度条的宽度，根据选课人数和最大选课人数计算 -->
                  </div>
                </div>
              </div>
            </div>

            <!-- 选课人数最少的课程 -->
            <div class="chart-section">
              <!-- 图表区域 -->
              <h3>选课人数后五课程</h3>
              <!-- 标题 -->
              <div class="course-list">
                <!-- 课程列表 -->
                <div v-for="course in bottomCourses" :key="course.courseId" class="course-item">
                  <!-- 循环渲染课程列表，key 为 course.courseId -->
                  <div class="course-info">
                    <!-- 课程信息 -->
                    <span class="course-name">{{ course.courseName }}</span>
                    <!-- 课程名称 -->
                    <span class="course-value">{{ course.selectedStudents }}人</span>
                    <!-- 选课人数 -->
                  </div>
                  <div class="progress-bar">
                    <!-- 进度条 -->
                    <div
                      class="progress warning"
                      :style="{ width: `${(course.selectedStudents / maxStudents) * 100}%` }"
                    ></div>
                    <!-- 进度条的宽度，根据选课人数和最大选课人数计算，warning 类用于显示警告颜色 -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教师管理区域 -->
      <div v-if="activeTab === 'teachers'" class="info-section">
        <!-- 如果 activeTab 为 'teachers'，则显示教师管理区域 -->
        <!-- 引入教师管理组件 -->
        <AdminTeacher />
        <!-- 引入 AdminTeacher 组件 -->
      </div>

      <!-- 学生管理区域 -->
      <div v-if="activeTab === 'students'" class="info-section">
        <!-- 如果 activeTab 为 'students'，则显示学生管理区域 -->
        <!-- 引入学生管理组件 -->
        <AdminStudent />
        <!-- 引入 AdminStudent 组件 -->
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
//导入教师管理组件
import AdminTeacher from './AdminTeacher.vue';
//导入学生管理组件
import AdminStudent from './AdminStudent.vue';

export default {
  name: "AdminHome", // 组件名称
  components: {
    // 注册组件
    AdminTeacher, // 教师管理组件
    AdminStudent // 学生管理组件
  },
  data() {
    // 组件数据
    return {
      activeTab: 'stats', // 当前激活的标签页，默认为 'stats'
      adminInfo: {
        // 管理员信息
        adminId: '', // 管理员工号
        name: '系统', // 管理员姓名，默认为 '系统'
        phone: '', // 管理员电话
        email: '' // 管理员邮箱
      },
      summary: {
        // 统计数据
        totalCourses: 0, // 总课程数
        totalStudents: 0, // 选课学生数
        remainingCapacity: 0 // 剩余容量
      },
      topCourses: [], // 选课人数最多的课程列表
      bottomCourses: [], // 选课人数最少的课程列表
      isEditing: false, // 是否处于编辑模式，默认为 false
      editInfo: {
        // 编辑的信息
        name: '', // 姓名
        phone: '', // 电话
        email: '' // 邮箱
      }
    };
  },
  computed: {
    // 计算属性
    maxStudents() {
      // 最大选课人数
      return Math.max(
        // 返回最大值
        ...this.topCourses.map(course => course.selectedStudents), // 从 topCourses 中提取选课人数
        ...this.bottomCourses.map(course => course.selectedStudents) // 从 bottomCourses 中提取选课人数
      );
    }
  },
  mounted() {
    // 组件挂载后执行
    this.fetchStats(); // 获取统计数据
    this.fetchAdminInfo(); // 获取管理员信息
  },
  methods: {
    // 组件方法
    switchTab(tab) {
      // 切换标签页
      this.activeTab = tab; // 设置当前激活的标签页
    },
    fetchStats() {
      // 获取统计数据
      axios.get('/api/admin/stats', {
        // 发送 GET 请求到 '/api/admin/stats'
        headers: {
          // 设置请求头
          Authorization: `Bearer ${localStorage.getItem('token')}` // 从 localStorage 中获取 token，并添加到 Authorization 请求头中
        }
      })
      .then(response => {
        // 请求成功
        if (response.data.status === 0) {
          // 如果状态码为 0
          const { summary, topCourses, bottomCourses } = response.data.data; // 从响应数据中提取 summary, topCourses, bottomCourses
          this.summary = summary; // 设置 summary
          this.topCourses = topCourses; // 设置 topCourses
          this.bottomCourses = bottomCourses; // 设置 bottomCourses
        }
      })
    },
    fetchAdminInfo() {
      // 获取管理员信息
      axios.get('/api/admin/info', {
        // 发送 GET 请求到 '/api/admin/info'
        headers: {
          // 设置请求头
          Authorization: `Bearer ${localStorage.getItem('token')}` // 从 localStorage 中获取 token，并添加到 Authorization 请求头中
        }
      })
      .then(response => {
        // 请求成功
        if (response.data.status === 0) {
          // 如果状态码为 0
          const data = response.data.data; // 从响应数据中提取数据
          this.adminInfo = {
            // 设置管理员信息
            adminId: data.admin_id, // 工号
            name: data.name, // 姓名
            phone: data.phone || '暂无', // 电话，如果为空则显示 '暂无'
            email: data.email || '暂无' // 邮箱，如果为空则显示 '暂无'
          };
        }
      })
    },
    handleLogout() {
      // 登出
      localStorage.removeItem('token'); // 从 localStorage 中移除 token
      this.$router.push('/login'); // 跳转到登录页面
    },
    startEdit() {
      // 开始编辑
      this.editInfo = {
        // 设置编辑信息
        name: this.adminInfo.name, // 姓名
        phone: this.adminInfo.phone, // 电话
        email: this.adminInfo.email // 邮箱
      }
      this.isEditing = true // 设置为编辑模式
    },
    cancelEdit() {
      // 取消编辑
      this.isEditing = false // 取消编辑模式
    },
    saveInfo() {
      // 保存信息
      axios.post('/api/admin/update', this.editInfo, {
        // 发送 POST 请求到 '/api/admin/update'，并传递 editInfo
        headers: {
          // 设置请求头
          Authorization: `Bearer ${localStorage.getItem('token')}` // 从 localStorage 中获取 token，并添加到 Authorization 请求头中
        }
      })
      .then(response => {
        // 请求成功
        if (response.data.status === 0) {
          // 如果状态码为 0
          alert('个人信息更新成功！') // 弹出提示框
          this.isEditing = false // 取消编辑模式
          this.fetchAdminInfo() // 重新获取信息
        } else {
          // 如果状态码不为 0
          alert(response.data.message) // 弹出错误信息
        }
      })
    }
  }
};
</script>

<style scoped>
/* 学生主页整体布局 */
.admin-home {
  display: flex; /* 使用 flex 布局 */
  min-height: 100vh; /* 最小高度为 100% 视口高度 */
}

/* 左侧导航栏样式 */
.sidebar {
  width: 220px; /* 宽度为 220px */
  background-color: #2f3e46; /* 背景颜色 */
  color: white; /* 字体颜色 */
  padding-top: 20px; /* 顶部内边距 */
}

/* 个人信息区域样式 */
.profile {
  text-align: center; /* 文本居中 */
  margin-bottom: 20px; /* 底部外边距 */
  padding: 16px; /* 内边距 */
  background-color: rgba(255, 255, 255, 0.1); /* 背景颜色，带有透明度 */
  border-radius: 8px; /* 边框圆角 */
}

/* 管理员信息样式 */
.admin-info {
  margin-bottom: 10px; /* 底部外边距 */
}

/* 欢迎信息样式 */
.greeting {
  font-size: 16px; /* 字体大小 */
  margin-bottom: 8px; /* 底部外边距 */
  color: #fff; /* 字体颜色 */
}

/* 用户名样式 */
.username {
  color: #42b983; /* 字体颜色 */
  font-weight: bold; /* 字体加粗 */
}

/* 个人信息行样式 */
.info-row {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  margin-bottom: 6px; /* 底部外边距 */
  justify-content: flex-start; /* 水平左对齐 */
}

/* 个人信息标签样式 */
.info-label {
  width: auto; /* 宽度自适应 */
  min-width: 40px; /* 最小宽度，防止内容太短时显示异常 */
  font-weight: bold; /* 字体加粗 */
  margin-right: 8px; /* 右侧外边距 */
  color: #ddd; /* 字体颜色 */
  font-size: 14px; /* 字体大小 */
  text-align: left; /* 文本左对齐 */
  white-space: nowrap; /* 强制不换行 */
}

/* 个人信息内容样式 */
.info-content {
  flex: 1; /* 占据剩余空间 */
  color: #eee; /* 字体颜色 */
  font-size: 14px; /* 字体大小 */
  text-align: left; /* 文本左对齐 */
  overflow-x: auto; /* 水平滚动 */
  white-space: nowrap; /* 防止内容换行 */
  padding: 5px; /* 增加内边距 */
}

/* 可滚动内容样式 */
.scrollable {
  overflow-x: auto; /* 水平滚动 */
  white-space: nowrap; /* 防止内容换行 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

/* 隐藏滚动条 */
.scrollable::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

/* 编辑按钮样式 */
.edit-button {
  padding: 6px 12px; /* 内边距 */
  background-color: #42b983; /* 背景颜色 */
  color: white; /* 字体颜色 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 边框圆角 */
  cursor: pointer; /* 鼠标指针样式 */
  font-size: 12px; /* 字体大小 */
  margin-top: 10px; /* 顶部外边距 */
}

.edit-button:hover {
  background-color: #348966; /* 鼠标悬停时的背景颜色 */
}

/* 导航菜单样式 */
.menu {
  list-style: none; /* 无列表样式 */
  padding: 0; /* 无内边距 */
}

/* 导航菜单项样式 */
.menu li {
  padding: 12px; /* 内边距 */
  text-align: center; /* 文本居中 */
  border-bottom: 1px solid #444; /* 底部边框 */
  cursor: pointer; /* 鼠标指针样式 */
}

/* 导航菜单项悬停效果 */
.menu li:hover {
  background-color: #1d272d; /* 鼠标悬停时的背景颜色 */
}

/* 激活的导航菜单项样式 */
.menu li.active {
  background-color: #42b983; /* 激活时的背景颜色 */
}

/* 右侧内容区样式 */
.main-content {
  flex-grow: 1; /* 占据剩余空间 */
  padding: 20px 24px; /* 内边距 */
  background-color: #f4f7fa; /* 背景颜色 */
  position: relative; /* 相对定位 */
}

/* 登出按钮样式 */
.logout-button {
  position: absolute; /* 绝对定位 */
  top: 20px; /* 顶部距离 */
  right: 24px; /* 右侧距离 */
  padding: 8px 16px; /* 内边距 */
  background-color: #f44336; /* 背景颜色 */
  color: white; /* 字体颜色 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 边框圆角 */
  cursor: pointer; /* 鼠标指针样式 */
}

/* 登出按钮悬停效果 */
.logout-button:hover {
  background-color: #d32f2f; /* 鼠标悬停时的背景颜色 */
}

/* 个人信息区域样式 */
.info-section .course-browse {
  background-color: white; /* 背景颜色 */
  padding: 24px; /* 内边距 */
  border-radius: 8px; /* 边框圆角 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.info-section .course-list-container {
  background-color: #f8f9fa !important; /* 背景颜色 */
  border-radius: 6px; /* 边框圆角 */
  padding: 16px; /* 内边距 */
  margin-top: 20px; /* 顶部外边距 */
}

.info-section .course-item {
  background-color: white; /* 背景颜色 */
  border: 1px solid #e9ecef; /* 边框 */
  border-radius: 4px; /* 边框圆角 */
  padding: 15px; /* 内边距 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 阴影 */
}

/* 标题样式 */
.section-title {
  color: #2c3e50; /* 字体颜色 */
  font-size: 1.5rem; /* 字体大小 */
  margin-bottom: 1.5rem; /* 底部外边距 */
  padding-bottom: 0.8rem; /* 底部内边距 */
  border-bottom: 2px solid #42b983; /* 底部边框 */
  display: block; /* 块级元素 */
}

/* 操作按钮容器样式 */
.action-buttons-container {
  margin-top: 24px; /* 顶部外边距 */
  padding-top: 24px; /* 顶部内边距 */
  border-top: 1px solid #eee; /* 顶部边框 */
  text-align: center; /* 文本居中 */
}

/* 编辑和保存按钮基础样式 */
.edit-button,
.save-button,
.cancel-button {
  padding: 8px 16px; /* 内边距 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 边框圆角 */
  cursor: pointer; /* 鼠标指针样式 */
  margin: 0 8px; /* 按钮间距 */
}

/* 保存按钮样式 */
.save-button {
  background-color: #2196f3; /* 背景颜色 */
  color: white; /* 字体颜色 */
}

/* 修改密码按钮样式 */
.password-button {
  background-color: #ff9800; /* 背景颜色 */
  color: white; /* 字体颜色 */
}

/* 禁用状态的按钮样式 */
.edit-button:disabled {
  background-color: #ccc; /* 背景颜色 */
  cursor: not-allowed; /* 鼠标指针样式 */
}

/* 个人信息输入框样式 */
.info-input {
  flex: 1; /* 占据剩余空间 */
  padding: 8px; /* 内边距 */
  border: 1px solid #e9ecef; /* 边框 */
  border-radius: 4px; /* 边框圆角 */
  max-width: 200px; /* 限制输入框宽度 */
  transition: border-color 0.3s; /* 过渡效果 */
}

.info-input:focus {
  border-color: #42b983; /* 聚焦时的边框颜色 */
}

.info-select {
  flex: 1; /* 占据剩余空间 */
  padding: 6px; /* 内边距 */
  background: white; /* 背景颜色 */
  border: 1px solid #e9ecef; /* 边框 */
  border-radius: 4px; /* 边框圆角 */
  max-width: 200px; /* 限制选择框宽度 */
}

/* 统计卡片样式 */
.stats-cards {
  display: grid; /* 使用 grid 布局 */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* 自适应列数 */
  gap: 20px; /* 间距 */
  margin-bottom: 24px; /* 底部外边距 */
}

.stat-card {
  background: white; /* 背景颜色 */
  padding: 20px; /* 内边距 */
  border-radius: 8px; /* 边框圆角 */
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.stat-icon {
  font-size: 2rem; /* 字体大小 */
  margin-right: 16px; /* 右侧外边距 */
  color: #42b983; /* 字体颜色 */
}

.stat-content {
  flex: 1; /* 占据剩余空间 */
}

.stat-value {
  font-size: 1.5rem; /* 字体大小 */
  font-weight: bold; /* 字体加粗 */
  color: #2c3e50; /* 字体颜色 */
}

.stat-label {
  color: #6c757d; /* 字体颜色 */
  font-size: 0.9rem; /* 字体大小 */
}

/* 图表区域样式 */
.chart-section {
  background: white; /* 背景颜色 */
  padding: 20px; /* 内边距 */
  border-radius: 8px; /* 边框圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.chart-section h3 {
  color: #2c3e50; /* 字体颜色 */
  margin-bottom: 20px; /* 底部外边距 */
  padding-bottom: 10px; /* 底部内边距 */
  border-bottom: 1px solid #e9ecef; /* 底部边框 */
}

.course-list {
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 垂直排列 */
  gap: 16px; /* 间距 */
}

.course-item {
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 垂直排列 */
  gap: 8px; /* 间距 */
}

.course-info {
  display: flex; /* 使用 flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中 */
}

.course-name {
  color: #2c3e50; /* 字体颜色 */
  font-weight: 500; /* 字体粗细 */
}

.course-value {
  color: #6c757d; /* 字体颜色 */
}

.progress-bar {
  width: 100%; /* 宽度 100% */
  height: 8px; /* 高度 */
  background: #e9ecef; /* 背景颜色 */
  border-radius: 4px; /* 边框圆角 */
  overflow: hidden; /* 溢出隐藏 */
}

.progress {
  height: 100%; /* 高度 100% */
  background: #42b983; /* 背景颜色 */
  border-radius: 4px; /* 边框圆角 */
  transition: width 0.3s ease; /* 过渡效果 */
}

.progress.warning {
  background: #ffc107; /* 背景颜色 */
}

.action-buttons {
  display: flex; /* 使用 flex 布局 */
  justify-content: center; /* 水平居中 */
  margin-top: 10px; /* 顶部外边距 */
}

.cancel-button {
  background-color: #6c757d; /* 背景颜色 */
  color: white; /* 字体颜色 */
}
</style>