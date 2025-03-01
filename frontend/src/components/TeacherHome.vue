<template>
  <div class="teacher-home">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="profile">
        <div v-if="!isEditing" class="avatar-container">
          <img class="avatar" :src="teacherInfo.avatarUrl" alt="头像" />
        </div>
        <div v-else class="avatar-container" @click="triggerFileInput">
          <img
            class="avatar"
            :src="previewAvatarUrl || teacherInfo.avatarUrl"
            alt="头像"
          />
          <div class="avatar-overlay">点击更换头像</div>
        </div>
        <div class="greeting">
          <span class="username">{{ username }}</span
          >老师，欢迎！
        </div>
      </div>

      <ul class="menu">
        <li
          :class="{ active: activeTab === 'info' }"
          @click="switchTab('info')"
        >
          个人信息
        </li>
        <li
          :class="{ active: activeTab === 'release' }"
          @click="switchTab('release')"
        >
          发布课程
        </li>
        <li
          :class="{ active: activeTab === 'students' }"
          @click="switchTab('students')"
        >
          已选学生
        </li>
      </ul>
    </div>

    <!-- 右侧内容 -->
    <div class="main-content">
      <div class="logout-button" @click="logout">登出</div>

      <!-- 个人信息 -->
      <div v-if="activeTab === 'info'" class="info-section">
        <div class="course-browse">
          <h1 class="section-title">个人信息</h1>
          <div class="course-list-container">
            <div class="course-item">
              <div class="course-info">
                <div class="info-row">
                  <span class="info-label">工号</span>
                  <span class="info-content">{{ teacherInfo.teacherId }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">姓名</span>
                  <span v-if="!isEditing" class="info-content">{{
                    teacherInfo.name
                  }}</span>
                  <input v-else v-model="teacherInfo.name" class="info-input" />
                </div>
                <div class="info-row">
                  <span class="info-label">性别</span>
                  <span v-if="!isEditing" class="info-content">{{
                    teacherInfo.gender
                  }}</span>
                  <select
                    v-else
                    v-model="teacherInfo.gender"
                    class="info-select"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div class="info-row">
                  <span class="info-label">职称</span>
                  <span v-if="!isEditing" class="info-content">{{
                    teacherInfo.title
                  }}</span>
                  <input
                    v-else
                    v-model="teacherInfo.title"
                    class="info-input"
                  />
                </div>
                <div class="info-row">
                  <span class="info-label">学院</span>
                  <span v-if="!isEditing" class="info-content">{{
                    teacherInfo.department
                  }}</span>
                  <input
                    v-else
                    v-model="teacherInfo.department"
                    class="info-input"
                  />
                </div>
                <div class="info-row">
                  <span class="info-label">电话</span>
                  <span v-if="!isEditing" class="info-content">{{
                    teacherInfo.phone
                  }}</span>
                  <input
                    v-else
                    v-model="teacherInfo.phone"
                    class="info-input"
                  />
                </div>
                <div class="info-row">
                  <span class="info-label">邮箱</span>
                  <span v-if="!isEditing" class="info-content">{{
                    teacherInfo.email
                  }}</span>
                  <input
                    v-else
                    v-model="teacherInfo.email"
                    class="info-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons-container">
            <div class="action-buttons">
              <button v-if="!isEditing" class="edit-button" @click="editInfo">
                编辑信息
              </button>
              <button v-else class="save-button" @click="saveInfo">保存</button>
              <button
                v-if="!isEditing"
                class="password-button"
                @click="openPasswordDialog"
              >
                修改密码
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 发布课程 -->
      <div v-if="activeTab === 'release'">
        <TeacherCourseRelease />
      </div>

      <!-- 已选学生 -->
      <div v-if="activeTab === 'students'">
        <TeacherSelectedStudents />
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      style="display: none"
      accept="image/*"
      @change="handleFileChange"
    />

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="30%">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="旧密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePasswordDialog">取消</el-button>
          <el-button type="primary" @click="updatePassword">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";
import TeacherCourseRelease from "./TeacherCourseRelease.vue";
import TeacherSelectedStudents from "./TeacherSelectedStudents.vue";
import {
  ElNotification,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
} from "element-plus";

export default {
  components: {
    TeacherCourseRelease,
    TeacherSelectedStudents,
    ElNotification,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElButton,
  },
  data() {
    return {
      activeTab: "info",
      username: "",
      isEditing: false,
      teacherInfo: {
        teacherId: "",
        name: "",
        gender: "",
        title: "",
        department: "",
        phone: "",
        email: "",
        avatarUrl: "",
      },
      selectedFile: null,
      previewAvatarUrl: "",
      passwordDialogVisible: false, // 控制密码修改对话框的显示
      passwordForm: {
        // 密码修改表单数据
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    };
  },
  created() {
    this.fetchTeacherInfo();
  },
  methods: {
    fetchTeacherInfo() {
      axios
        .get("/api/teacher/info", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          if (response.data.status === 0) {
            const data = response.data.data;
            this.teacherInfo = {
              teacherId: data.teacher_id,
              name: data.name,
              gender: data.gender || "",
              title: data.title || "",
              department: data.department || "",
              phone: data.phone || "",
              email: data.email || "",
              avatarUrl: data.avatar_url || "",
            };
            this.username = data.name;
          }
        });
    },
    switchTab(tab) {
      this.activeTab = tab;
    },
    editInfo() {
      this.isEditing = true;
    },
    saveInfo() {
      const formData = new FormData();
      formData.append("name", this.teacherInfo.name);
      formData.append("gender", this.teacherInfo.gender);
      formData.append("title", this.teacherInfo.title);
      formData.append("department", this.teacherInfo.department);
      formData.append("phone", this.teacherInfo.phone);
      formData.append("email", this.teacherInfo.email);
      if (this.selectedFile) formData.append("avatar_url", this.selectedFile);

      axios
        .post("/api/teacher/update", formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          if (response.data.status === 0) {
            alert("信息更新成功！");
            this.isEditing = false;
            if (this.selectedFile) {
              this.teacherInfo.avatarUrl = `/avatar/${this.selectedFile.name}`;
            }
            this.selectedFile = null;
            this.previewAvatarUrl = "";
          } else {
            // 显示验证错误信息
            alert(response.data.message);
          }
        });
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.previewAvatarUrl = URL.createObjectURL(file);
      }
    },
    // 打开密码修改对话框
    openPasswordDialog() {
      this.passwordDialogVisible = true;
      this.passwordForm = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    },

    // 关闭密码修改对话框
    closePasswordDialog() {
      this.passwordDialogVisible = false;
    },

    // 修改密码
    updatePassword() {
      if (
        !this.passwordForm.oldPassword ||
        !this.passwordForm.newPassword ||
        !this.passwordForm.confirmPassword
      ) {
        alert("请填写所有密码字段！");
        return;
      }

      axios
        .post(
          "/api/teacher/updatepwd",
          {
            old_pwd: this.passwordForm.oldPassword,
            new_pwd: this.passwordForm.newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          if (response.data.status === 0) {
            ElNotification({
              title: "成功",
              message: "密码修改成功！",
              type: "success",
            });
            this.closePasswordDialog();
          } else {
            alert(response.data.message);
          }
        });
    },
  },
};
</script>

<style scoped>
/* 统一学生端样式 */
.teacher-home {
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
  text-align: center;
  margin-bottom: 30px;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  margin: 0 auto 15px;
  width: 80px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
}

.greeting {
  font-size: 16px;
  padding: 0 15px;
}

.username {
  color: #42b983;
  font-weight: 600;
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
  transition: background 0.2s;
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

.course-item {
  background-color: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

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

.info-input,
.info-select {
  flex: 1;
  padding: 6px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  max-width: 200px;
  transition: border-color 0.3s;
}

.info-input:focus,
.info-select:focus {
  border-color: #42b983;
}

.action-buttons-container {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  text-align: center;
}

.action-buttons {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.edit-button,
.save-button,
.password-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0 8px; /* 添加左右间距 */
}

.edit-button {
  background-color: #42b983;
  color: white;
}

.save-button {
  background-color: #2196f3;
  color: white;
}

.password-button {
  background-color: #ff9800;
  color: white;
}

.edit-button:hover {
  background-color: #369f6e;
}

.save-button:hover {
  background-color: #1e88e5;
}

.password-button:hover {
  background-color: #f57c00;
}
</style>
