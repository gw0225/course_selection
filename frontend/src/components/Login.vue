<template>
  <div class="login-container">
    <div class="form-wrapper">
      <!-- 动态设置标题 -->
      <h2 class="title">{{ pageTitle }}</h2>
      <form @submit.prevent="handleLogin">
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
          <label>{{ userType === "student" ? "学号" : "工号" }}</label>
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

        <!-- 登录按钮 -->
        <button type="submit">登录</button>
      </form>
      <p>还没有账号？<router-link to="/reg">去注册</router-link></p>
    </div>
  </div>
</template>

<script>
import request from "../utils/request";

export default {
  name: "Login",
  data() {
    return {
      // 用户类型，默认为学生
      userType: "student",
      // 用户输入的账号（比如学号）
      account: "",
      // 用户输入的密码
      password: "",
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
    // 处理用户点击登录按钮的方法
    handleLogin() {
      // 统一登录处理逻辑

      // 根据用户类型动态设置请求的 API 路径
      const userApi = {
        student: "/student/login",
        teacher: "/teacher/loginteacher",
        admin: "/admin/loginadmin"
      }[this.userType]

      // 根据用户类型动态设置请求的 ID 字段名
      const idField = {
        student: "student_id",
        teacher: "teacher_id",
        admin: "admin_id"
      }[this.userType]

      if (!userApi) {
        alert("该用户类型暂不支持登录")
        return
      }

      // 发送登录请求
      request
        .post(userApi, {
          [idField]: this.account, // 动态设置 ID 字段（学号或工号）
          password: this.password, // 用户输入的密码
          role: this.userType, // 用户角色（student 或 teacher）
        })
        .then((res) => {
          // 登录成功处理
          if (res.status === 0) {
            // 保存 token 和用户类型到本地存储
            localStorage.setItem("token", res.token); // 存储登录 token
            localStorage.setItem("userType", this.userType); // 存储用户类型

            // 提示登录成功
            alert("登录成功！");

            // 根据用户类型跳转到对应的主页
            this.$router.push(
              {
                student: "/student-home", // 学生跳转到学生主页
                teacher: "/teacher-home", // 教师跳转到教师主页
                admin: "/admin-home", // 管理员跳转到管理员主页
              }[this.userType]
            );
          } else {
            // 登录失败提示
            alert(res.message); // 显示后端返回的错误信息
          }
        })
        .catch((err) => {
          // 请求失败处理（例如网络错误或服务器错误）
          console.error("登录请求失败:", err);
          alert("登录失败，请稍后重试");
        });
    },
  },
};
</script>
<style scoped>
/* 共用的输入框样式 */
input,
select {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 5px;
  width: 100%;
  transition: all 0.3s ease-in-out;
}

/* 输入框聚焦效果 */
input:focus,
select:focus {
  border-color: #42b983;
  box-shadow: 0 0 8px rgba(66, 185, 131, 0.5);
}

/* 页面背景 */
.login-container {
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

/* 标题样式 */
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

/* 链接样式 */
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
