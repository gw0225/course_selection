<template>
  <!-- 学生主页容器 -->
  <div class="student-home">
    <!-- 左侧导航栏：包含个人信息和导航菜单 -->
    <div class="sidebar">
      <!-- 个人信息区域 -->
      <div class="profile">
        <!-- 头像显示区域 -->
        <div v-if="!isEditing" class="avatar-container">
          <!-- 非编辑模式下显示头像 -->
          <img class="avatar" :src="studentInfo.avatarUrl" alt="头像" />
        </div>
        <div v-else class="avatar-container" @click="triggerFileInput">
          <!-- 编辑模式下显示可点击的头像区域 -->
          <img class="avatar" :src="previewAvatarUrl || studentInfo.avatarUrl" alt="头像" />
          <!-- 头像上传提示 -->
          <div class="avatar-overlay">点击此处更换头像</div>
        </div>
        <!-- 欢迎信息区域 -->
        <div class="greeting">
          <!-- 显示学生姓名 -->
          <span class="username">{{ username }}</span>同学，欢迎登录！
        </div>
      </div>

      <!-- 导航菜单 -->
      <ul class="menu">
        <!-- 个人信息导航项 -->
        <li :class="{ active: activeTab === 'info' }" @click="switchTab('info')">
          个人信息
        </li>
        <!-- 课程浏览导航项 -->
        <li :class="{ active: activeTab === 'courses' }" @click="switchTab('courses')">
          课程浏览
        </li>
        <!-- 已选课程导航项 -->
        <li :class="{ active: activeTab === 'selected' }" @click="switchTab('selected')">
          已选课程
        </li>
      </ul>
    </div>

    <!-- 右侧主内容区域 -->
    <div class="main-content">
      <!-- 登出按钮 -->
      <div class="logout-button" @click="logout">登出</div>

      <!-- 个人信息展示区域 -->
      <div v-if="activeTab === 'info'" class="info-section">
        <div class="course-browse">
          <h1 class="section-title">个人信息</h1>
          <div class="course-list-container">
            <div class="course-item">
              <div class="course-info">
                <!-- 学号 -->
                <div class="info-row">
                  <span class="info-label">学号</span>
                  <span class="info-content">{{ studentInfo.studentId }}</span>
                </div>
                <!-- 姓名 -->
                <div class="info-row">
                  <span class="info-label">姓名</span>
                  <span v-if="!isEditing" class="info-content">{{ studentInfo.name }}</span>
                  <input v-else v-model="studentInfo.name" class="info-input" type="text" />
                </div>
                <!-- 性别 -->
                <div class="info-row">
                  <span class="info-label">性别</span>
                  <span v-if="!isEditing" class="info-content">{{ studentInfo.gender }}</span>
                  <select v-else v-model="studentInfo.gender" class="info-select">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <!-- 学院 -->
                <div class="info-row">
                  <span class="info-label">学院</span>
                  <span v-if="!isEditing" class="info-content">{{ studentInfo.college }}</span>
                  <input v-else v-model="studentInfo.college" class="info-input" type="text" />
                </div>
                <!-- 班级 -->
                <div class="info-row">
                  <span class="info-label">班级</span>
                  <span v-if="!isEditing" class="info-content">{{ studentInfo.class }}</span>
                  <input v-else v-model="studentInfo.class" class="info-input" type="text" />
                </div>
                <!-- 电话 -->
                <div class="info-row">
                  <span class="info-label">电话</span>
                  <span v-if="!isEditing" class="info-content">{{ studentInfo.phone }}</span>
                  <input v-else v-model="studentInfo.phone" class="info-input" type="text" />
                </div>
                <!-- 邮箱 -->
                <div class="info-row">
                  <span class="info-label">邮箱</span>
                  <span v-if="!isEditing" class="info-content">{{ studentInfo.email }}</span>
                  <input v-else v-model="studentInfo.email" class="info-input" type="text" />
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮区域 -->
          <div class="action-buttons-container">
            <div class="action-buttons">
              <button v-if="!isEditing" class="edit-button" @click="editInfo">
                编辑个人信息
              </button>
              <button v-else class="save-button" @click="saveInfo">保存</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 课程浏览区域 -->
      <div v-if="activeTab === 'courses'">
        <!-- 引入课程浏览组件 -->
        <StudentBrowse />
      </div>
      <!-- 已选课程区域 -->
      <div v-if="activeTab ==='selected'">
        <!-- 引入已选课程组件 -->
        <StudentSelected />
      </div>
    </div>

    <!-- 隐藏的文件输入框，用于头像上传 -->
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      accept="image/*"
      @change="handleFileChange"
    />
  </div>
</template>

<script>
// 导入axios用于HTTP请求
import axios from 'axios'
// 导入课程浏览组件
import StudentBrowse from './StudentBrowse.vue'
// 导入已选课程组件
import StudentSelected from './StudentSelected.vue';

export default {
  // 注册子组件
  components: {
    StudentBrowse,
    StudentSelected
  },

  // 组件数据
  data() {
    return {
      activeTab: 'info', // 当前激活的标签页
      username: '', // 学生姓名
      isEditing: false, // 是否处于编辑模式
      studentInfo: { // 学生信息对象
        studentId: '', // 学号
        name: '', // 姓名
        gender: '', // 性别
        college: '', // 学院
        class: '', // 班级
        phone: '', // 电话
        email: '', // 邮箱
        avatarUrl: '', // 头像URL
      },
      selectedFile: null, // 选择的头像文件
      previewAvatarUrl: '' // 头像预览URL
    }
  },

  // 生命周期钩子：组件创建时调用
  created() {
    this.fetchStudentInfo() // 获取学生信息
  },

  // 组件方法
  methods: {
    // 获取学生信息
    fetchStudentInfo() {
      axios.get('/api/student/info', {
        headers: {
          // 携带认证token
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (response.data.status === 0) {
          const data = response.data.data
          // 更新学生信息
          this.studentInfo = {
            studentId: data.student_id,
            name: data.name,
            gender: data.gender || '',
            college: data.faculty || '',
            class: data.class_name || '',
            phone: data.phone || '',
            email: data.email || '',
            avatarUrl: data.avatar_url || '',
          }
          this.username = data.name
        }
      })
    },

    // 切换标签页
    switchTab(tab) {
      this.activeTab = tab
    },

    // 进入编辑模式
    editInfo() {
      this.isEditing = true
    },

    // 保存个人信息
    saveInfo() {
      const formData = new FormData()
      // 添加表单数据
      formData.append('name', this.studentInfo.name)
      formData.append('gender', this.studentInfo.gender)
      formData.append('faculty', this.studentInfo.college)
      formData.append('class_name', this.studentInfo.class)
      formData.append('phone', this.studentInfo.phone)
      formData.append('email', this.studentInfo.email)

      // 如果有选择新头像，添加到表单数据
      if (this.selectedFile) {
        formData.append('avatar_url', this.selectedFile)
      }

      // 发送更新请求
      axios.post('/api/student/update', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        // 注意：即使是验证错误，也会进入 then 块
        if (response.data.status === 0) {
          alert('个人信息更新成功！')
          this.isEditing = false
          if (this.selectedFile) {
            this.studentInfo.avatarUrl = `/avatar/${this.selectedFile.name}`
          }
          this.selectedFile = null
          this.previewAvatarUrl = ''
        } else {
          // 显示验证错误信息
          alert(response.data.message)
        }
      })
    },

    // 登出功能
    logout() {
      // 移除token
      localStorage.removeItem('token')
      // 跳转到登录页
      this.$router.push('/login')
    },

    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    // 处理文件选择变化
    handleFileChange(event) {
      const file = event.target.files[0]
      if (file) {
        this.selectedFile = file
        // 生成预览URL
        this.previewAvatarUrl = URL.createObjectURL(file)
      }
    }
  }
}
</script>

<style scoped>
/* 学生主页整体布局 */
.student-home {
  display: flex;
  min-height: 100vh;
}

/* 左侧导航栏样式 */
.sidebar {
  width: 220px;
  background-color: #2f3e46;
  color: white;
  padding-top: 20px;
}

/* 个人信息区域样式 */
.profile {
  text-align: center;
  margin-bottom: 30px;
}

/* 头像容器样式 */
.avatar-container {
  position: relative;
  cursor: pointer;
}

/* 头像样式 */
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

/* 头像上传提示样式 */
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
}

/* 欢迎信息样式 */
.greeting {
  font-size: 16px;
  margin-top: 10px;
}

/* 用户名样式 */
.username {
  color: red;
  font-weight: bold;
}

/* 导航菜单样式 */
.menu {
  list-style: none;
  padding: 0;
}

/* 导航菜单项样式 */
.menu li {
  padding: 12px;
  text-align: center;
  border-bottom: 1px solid #444;
  cursor: pointer;
}

/* 导航菜单项悬停效果 */
.menu li:hover {
  background-color: #1d272d;
}

/* 激活的导航菜单项样式 */
.menu li.active {
  background-color: #42b983;
}

/* 右侧内容区样式 */
.main-content {
  flex-grow: 1;
  padding: 20px 24px; /* 左右24px与StudentBrowse.vue统一 */
  background-color: #f4f7fa;
  position: relative;
}

/* 登出按钮样式 */
.logout-button {
  position: absolute;
  top: 20px;
  right: 24px; /* 与右侧padding一致 */
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 登出按钮悬停效果 */
.logout-button:hover {
  background-color: #d32f2f;
}

/* 个人信息区域样式 */
.info-section .course-browse {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.info-section .course-list-container {
  background-color: #f8f9fa !important;
  border-radius: 6px;
  padding: 16px;
  margin-top: 20px;
}

.info-section .course-item {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 标题样式 */
.section-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #42b983;
  display: block;
}

/* 操作按钮容器样式 */
.action-buttons-container {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  text-align: center; /* 按钮居中 */
}

/* 编辑和保存按钮基础样式 */
.edit-button,
.save-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 编辑按钮样式 */
.edit-button {
  background-color: #42b983;
  color: white;
}

/* 保存按钮样式 */
.save-button {
  background-color: #2196f3;
  color: white;
}

/* 编辑按钮悬停效果 */
.edit-button:hover {
  background-color: #369f6e;
}

/* 保存按钮悬停效果 */
.save-button:hover {
  background-color: #1e88e5;
}

/* 信息行样式 */
.info-row {
  display: flex;
  align-items: center;
  margin: 12px 0;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.info-label {
  flex: 0 0 120px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.info-content {
  flex: 1;
  color: #6c757d;
  font-size: 0.9rem;
}

.info-input {
  flex: 1;
  padding: 6px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  max-width: 200px; /* 限制输入框宽度 */
  transition: border-color 0.3s;
}

.info-input:focus {
  border-color: #42b983;
}

.info-select {
  flex: 1;
  padding: 6px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  max-width: 200px; /* 限制选择框宽度 */
}
</style>