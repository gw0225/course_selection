<template>
  <div class="reg-container">
    <div class="form-wrapper">
      <!-- 动态设置标题 -->
      <h2 class="title">{{ pageTitle }}</h2>
      <form @submit.prevent="handleRegister">
        <!-- 用户身份选择 -->
        <div class="form-group">
          <label>用户身份</label>
          <select v-model="userType" required>
            <option value="student">学生</option>
            <option value="teacher">教师</option>
            <option value="admin">管理员</option>
          </select>
        </div>

        <!-- 用户名输入框 -->
        <div class="form-group">
          <label>姓名</label>
          <input
            type="text"
            v-model="username"
            placeholder="请输入用户名"
            required
          />
        </div>

        <!-- 学号/工号输入框 -->
        <div class="form-group">
          <label>{{ userType === 'student' ? '学号' : '工号' }}</label>
          <input
            type="text"
            v-model="account"
            :placeholder="userType === 'student' ? '请输入学号' : '请输入工号'"
            required
          />
        </div>

        <!-- 密码输入框 -->
        <div class="form-group">
          <label>密码</label>
          <input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <!-- 确认密码输入框 -->
        <div class="form-group">
          <label>确认密码</label>
          <input
            type="password"
            v-model="confirmPassword"
            placeholder="请再次输入密码"
            required
          />
        </div>

        <!-- 注册按钮 -->
        <button type="submit">注册</button>
      </form>
      <p>
        已有账号？<router-link to="/login">去登录</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: "Reg",
  data() {
    return {
      userType: "student",
      username: "",
      account: "",
      password: "",
      confirmPassword: "",
    };
  },
  computed: {
    // 根据用户类型动态设置标题
    pageTitle() {
      switch (this.userType) {
        case "student":
          return "学生选课系统";
        case "teacher":
          return "教师选课系统";
        case "admin":
          return "管理员系统";
        default:
          return "选课系统";
      }
    },
  },
  methods: {
    handleRegister() {
      // 验证密码是否一致
      if (this.password !== this.confirmPassword) {
        alert("两次密码输入不一致！");
        return;
      }

      // 根据用户类型动态设置请求参数
      const userApi = {
        student: "/student/register",
        teacher: "/teacher/regteacher",
        admin: "/admin/regadmin"
      }[this.userType];

      const idField = {
        student: "student_id",
        teacher: "teacher_id",
        admin: "admin_id"
      }[this.userType];

      if (!userApi) {
        alert("该用户类型暂不支持注册");
        return;
      }

      // 发送注册请求
      request
        .post(userApi, {
          [idField]: this.account,    // 动态ID字段
          username: this.username,    // 姓名
          password: this.password,    // 密码
          repassword: this.confirmPassword  // 确认密码
        })
        .then(res => {
          if (res.status === 0) {
            alert("注册成功！");
            this.$router.push("/login");
          } else {
            alert(res.message);
          }
        })
        .catch(err => {
          console.error("注册请求失败:", err);
          alert("注册失败，请稍后重试");
        });
    },
  },
};
</script>

<style scoped>
/* 共用的输入框样式 */
input, select {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 5px;
  width: 100%;
  transition: all 0.3s ease-in-out;
}

input:focus, select:focus {
  border-color: #42b983;
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.5);
}

/* 页面背景 */
.reg-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.form-wrapper {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  padding: 40px;
  width: 400px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.title {
  text-align: center;
  font-size: 30px;
  color: #42b983;
  margin-bottom: 20px;
}

button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #388e8e;
}

p {
  text-align: center;
  margin-top: 20px;
}

router-link {
  color: #42b983;
  text-decoration: none;
}

router-link:hover {
  text-decoration: underline;
}
</style>
