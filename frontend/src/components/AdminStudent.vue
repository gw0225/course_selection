<template>
  <div class="admin-student-container">
    <!-- 学生管理容器，包含标题、搜索筛选、统计信息、数据表格和分页 -->
    <h1 class="section-title">学生管理</h1>
    <!-- 页面标题 -->

    <!-- 搜索和筛选区域 -->
    <div class="filters">
      <!-- 搜索和筛选输入框及按钮的容器 -->
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索学生姓名、学院或ID..."
        class="search-input"
      />
      <!-- 搜索输入框，双向绑定 searchQuery，用于搜索学生姓名、学院或ID -->

      <select v-model="selectedFaculty" class="form-control">
        <!-- 学院筛选下拉框，双向绑定 selectedFaculty -->
        <option value="">全部学院</option>
        <!-- 默认选项：全部学院 -->
        <option v-for="faculty in faculties" :key="faculty" :value="faculty">
          {{ faculty }}
        </option>
        <!-- 循环渲染学院选项，faculty 为学院名称，value 和显示文本都为学院名称 -->
      </select>

      <button
        class="batch-btn"
        @click="openBatchResetDialog"
        :disabled="selectedStudents.length === 0"
      >
        批量重置密码
      </button>
      <!-- 批量重置密码按钮，点击时打开批量重置密码对话框，禁用状态取决于是否选择了学生 -->

      <button
        class="batch-btn delete-btn"
        @click="openBatchDeleteDialog"
        :disabled="selectedStudents.length === 0"
      >
        批量删除
      </button>
      <!-- 批量删除按钮，点击时打开批量删除对话框，禁用状态取决于是否选择了学生 -->
    </div>

    <!-- 统计信息 -->
    <div class="stats-container">
      <!-- 统计信息容器，显示总学生数和当前筛选的学生数 -->
      <div class="stat-item">
        <!-- 单个统计项 -->
        <span class="stat-label">👥总学生数：</span>
        <!-- 统计标签：总学生数 -->
        <span class="stat-value">{{ totalStudents }}</span>
        <!-- 统计值：总学生数 -->
      </div>
      <div class="stat-item">
        <!-- 单个统计项 -->
        <span class="stat-label">🔍当前筛选：</span>
        <!-- 统计标签：当前筛选 -->
        <span class="stat-value">{{ filteredStudents.length }}</span>
        <!-- 统计值：当前筛选的学生数 -->
      </div>
    </div>

    <!-- 数据表格 -->
    <div v-if="loading" class="status-message loading">⏳ 数据加载中...</div>
    <!-- 加载状态提示信息，当 loading 为 true 时显示 -->
    <div v-else-if="error" class="status-message error">❌ {{ error }}</div>
    <!-- 错误状态提示信息，当 error 不为空时显示 -->
    <div v-else class="data-container">
      <!-- 数据容器，当 loading 和 error 都为空时显示 -->
      <div class="data-list">
        <!-- 数据列表 -->
        <div class="table-header">
          <!-- 表头 -->
          <div class="header-cell checkbox-col">
            <!-- 复选框列头 -->
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <!-- 全选复选框，checked 属性绑定 isAllSelected，change 事件绑定 toggleSelectAll 方法 -->
          </div>
          <div class="header-cell id-col">学生ID</div>
          <!-- 学生ID列头 -->
          <div class="header-cell name-col">姓名</div>
          <!-- 姓名列头 -->
          <div class="header-cell faculty-col">学院</div>
          <!-- 学院列头 -->
          <div class="header-cell class-name-col">班级</div>
          <!-- 班级列头 -->
          <div class="header-cell phone-col">电话</div>
          <!-- 电话列头 -->
          <div class="header-cell email-col">邮箱</div>
          <!-- 邮箱列头 -->
          <div class="header-cell actions-col">操作</div>
          <!-- 操作列头 -->
        </div>

        <div
          v-for="student in paginatedStudents"
          :key="student.student_id"
          class="data-item"
        >
          <!-- 循环渲染学生数据，student 为学生对象，key 为 student.student_id -->
          <div class="cell checkbox-col">
            <!-- 复选框列 -->
            <input
              type="checkbox"
              :value="student.student_id"
              v-model="selectedStudents"
            />
            <!-- 学生复选框，value 属性绑定 student.student_id，v-model 绑定 selectedStudents -->
          </div>
          <div class="cell id-col">{{ student.student_id }}</div>
          <!-- 学生ID列 -->
          <div class="cell name-col">{{ student.name }}</div>
          <!-- 姓名列 -->
          <div class="cell faculty-col">{{ student.faculty }}</div>
          <!-- 学院列 -->
          <div class="cell class-name-col">{{ student.class_name }}</div>
          <!-- 班级列 -->
          <div class="cell phone-col">{{ student.phone }}</div>
          <!-- 电话列 -->
          <div class="cell email-col">{{ student.email }}</div>
          <!-- 邮箱列 -->
          <div class="cell actions-col">
            <!-- 操作列 -->
            <button
              class="action-btn reset-btn"
              @click="openResetDialog(student)"
            >
              重置密码
            </button>
            <!-- 重置密码按钮，点击时打开重置密码对话框，传递 student 对象 -->
            <button
              class="action-btn delete-btn"
              @click="openDeleteDialog(student)"
            >
              删除
            </button>
            <!-- 删除按钮，点击时打开删除对话框，传递 student 对象 -->
          </div>
        </div>

        <div v-if="!filteredStudents.length" class="status-message empty">
          🕳️ 未找到匹配学生
        </div>
        <!-- 当没有匹配的学生时显示提示信息 -->
      </div>

      <!-- 分页控件 -->
      <div class="pagination-controls">
        <!-- 分页控制按钮容器 -->
        <button
          class="pagination-btn"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        <!-- 上一页按钮，点击时切换到上一页，禁用状态取决于是否为第一页 -->
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages || 1 }} 页
        </span>
        <!-- 页码信息，显示当前页码和总页数 -->
        <button
          class="pagination-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages || totalPages === 0"
        >
          下一页
        </button>
        <!-- 下一页按钮，点击时切换到下一页，禁用状态取决于是否为最后一页 -->
      </div>
    </div>

    <!-- 重置密码确认对话框 -->
    <div
      v-if="showResetDialog"
      class="dialog-mask"
      @click.self="closeResetDialog"
    >
      <!-- 对话框遮罩层，当 showResetDialog 为 true 时显示，点击自身时关闭对话框 -->
      <div class="dialog-wrapper">
        <!-- 对话框内容容器 -->
        <div class="dialog-header">
          <!-- 对话框头部 -->
          <h3>确认重置密码</h3>
          <!-- 标题 -->
          <button class="close-btn" @click="closeResetDialog">×</button>
          <!-- 关闭按钮，点击时关闭对话框 -->
        </div>
        <div class="dialog-body">
          <!-- 对话框主体 -->
          <p>确认重置学生 {{ currentStudent?.name }} 的密码？</p>
          <!-- 确认信息，显示当前学生的姓名 -->
          <div class="action-buttons">
            <!-- 操作按钮容器 -->
            <button class="btn cancel" @click="closeResetDialog">取消</button>
            <!-- 取消按钮，点击时关闭对话框 -->
            <button class="btn confirm" @click="confirmResetPassword">
              确认
            </button>
            <!-- 确认按钮，点击时确认重置密码 -->
          </div>
        </div>
      </div>
    </div>

    <!-- 删除学生确认对话框 -->
    <div
      v-if="showDeleteDialog"
      class="dialog-mask"
      @click.self="closeDeleteDialog"
    >
      <!-- 对话框遮罩层，当 showDeleteDialog 为 true 时显示，点击自身时关闭对话框 -->
      <div class="dialog-wrapper">
        <!-- 对话框内容容器 -->
        <div class="dialog-header">
          <!-- 对话框头部 -->
          <h3>确认删除学生</h3>
          <!-- 标题 -->
          <button class="close-btn" @click="closeDeleteDialog">×</button>
          <!-- 关闭按钮，点击时关闭对话框 -->
        </div>
        <div class="dialog-body">
          <!-- 对话框主体 -->
          <p>确认删除学生 {{ currentStudent?.name }} ？</p>
          <!-- 确认信息，显示当前学生的姓名 -->
          <div class="action-buttons">
            <!-- 操作按钮容器 -->
            <button class="btn cancel" @click="closeDeleteDialog">取消</button>
            <!-- 取消按钮，点击时关闭对话框 -->
            <button class="btn confirm" @click="confirmDeleteStudent">
              确认
            </button>
            <!-- 确认按钮，点击时确认删除学生 -->
          </div>
        </div>
      </div>
    </div>

    <!-- 批量重置密码确认对话框 -->
    <div
      v-if="showBatchResetDialog"
      class="dialog-mask"
      @click.self="closeBatchResetDialog"
    >
      <!-- 对话框遮罩层，当 showBatchResetDialog 为 true 时显示，点击自身时关闭对话框 -->
      <div class="dialog-wrapper">
        <!-- 对话框内容容器 -->
        <div class="dialog-header">
          <!-- 对话框头部 -->
          <h3>确认批量重置密码</h3>
          <!-- 标题 -->
          <button class="close-btn" @click="closeBatchResetDialog">×</button>
          <!-- 关闭按钮，点击时关闭对话框 -->
        </div>
        <div class="dialog-body">
          <!-- 对话框主体 -->
          <p>确认批量重置 {{ selectedStudents.length }} 位学生的密码？</p>
          <!-- 确认信息，显示选择的学生数量 -->
          <div class="action-buttons">
            <!-- 操作按钮容器 -->
            <button class="btn cancel" @click="closeBatchResetDialog">
              取消
            </button>
            <!-- 取消按钮，点击时关闭对话框 -->
            <button class="btn confirm" @click="confirmBatchResetPassword">
              确认
            </button>
            <!-- 确认按钮，点击时确认批量重置密码 -->
          </div>
        </div>
      </div>
    </div>

    <!-- 批量删除学生确认对话框 -->
    <div
      v-if="showBatchDeleteDialog"
      class="dialog-mask"
      @click.self="closeBatchDeleteDialog"
    >
      <!-- 对话框遮罩层，当 showBatchDeleteDialog 为 true 时显示，点击自身时关闭对话框 -->
      <div class="dialog-wrapper">
        <!-- 对话框内容容器 -->
        <div class="dialog-header">
          <!-- 对话框头部 -->
          <h3>确认批量删除学生</h3>
          <!-- 标题 -->
          <button class="close-btn" @click="closeBatchDeleteDialog">×</button>
          <!-- 关闭按钮，点击时关闭对话框 -->
        </div>
        <div class="dialog-body">
          <!-- 对话框主体 -->
          <p>确认批量删除 {{ selectedStudents.length }} 位学生？</p>
          <!-- 确认信息，显示选择的学生数量 -->
          <div class="action-buttons">
            <!-- 操作按钮容器 -->
            <button class="btn cancel" @click="closeBatchDeleteDialog">
              取消
            </button>
            <!-- 取消按钮，点击时关闭对话框 -->
            <button class="btn confirm" @click="confirmBatchDeleteStudents">
              确认
            </button>
            <!-- 确认按钮，点击时确认批量删除学生 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"; // 导入 axios，用于发送 HTTP 请求
import { ElNotification } from "element-plus"; // 导入 ElNotification，用于显示通知

export default {
  data() {
    return {
      students: [], // 学生数据列表
      loading: true, // 是否正在加载数据
      error: null, // 错误信息
      searchQuery: "", // 搜索关键词
      selectedFaculty: "", // 选择的学院
      currentPage: 1, // 当前页码
      pageSize: 5, // 每页显示的学生数量
      selectedStudents: [], // 选择的学生ID列表
      showResetDialog: false, // 是否显示重置密码对话框
      showDeleteDialog: false, // 是否显示删除对话框
      showBatchResetDialog: false, // 是否显示批量重置密码对话框
      showBatchDeleteDialog: false, // 是否显示批量删除对话框
      currentStudent: null, // 当前操作的学生对象
      faculties: [
        "计算机学院",
        "医学院",
        "文学院",
        "外国语学院",
        "传媒艺术学院",
      ], // 学院列表
      totalStudents: 0, // 总学生数
    };
  },
  computed: {
    filteredStudents() {
      // 计算属性：筛选后的学生列表
      return this.students.filter((student) => {
        // 使用 filter 方法筛选学生
        const nameMatch =
          student.name
            ?.toLowerCase()
            .includes(this.searchQuery.toLowerCase()) || false;
        // 姓名是否匹配搜索关键词，使用 includes 方法判断是否包含，toLowerCase 方法转换为小写
        const facultyMatch =
          student.faculty
            ?.toLowerCase()
            .includes(this.searchQuery.toLowerCase()) || false;
        // 学院是否匹配搜索关键词
        const idMatch = String(student.student_id).includes(this.searchQuery);
        // 学生ID是否匹配搜索关键词，先将 student_id 转换为字符串

        const matchSearch = nameMatch || facultyMatch || idMatch;
        // 是否匹配搜索关键词，姓名、学院或学生ID匹配即可

        const matchFaculty =
          !this.selectedFaculty || student.faculty === this.selectedFaculty;
        // 是否匹配选择的学院，如果未选择学院，则所有学生都匹配

        return matchSearch && matchFaculty;
        // 同时满足搜索关键词和学院筛选条件的学生才会被筛选出来
      });
    },
    totalPages() {
      // 计算属性：总页数
      return Math.ceil(this.filteredStudents.length / this.pageSize);
      // 使用 Math.ceil 方法向上取整，计算总页数
    },
    paginatedStudents() {
      // 计算属性：分页后的学生列表
      const start = (this.currentPage - 1) * this.pageSize;
      // 计算起始索引
      const end = start + this.pageSize;
      // 计算结束索引
      return this.filteredStudents.slice(start, end);
      // 使用 slice 方法截取分页后的学生列表
    },
    isAllSelected() {
      // 计算属性：是否选择了当前页的所有学生
      return this.paginatedStudents.every((student) =>
        this.selectedStudents.includes(student.student_id)
      );
      // 使用 every 方法判断当前页的所有学生是否都被选择
    },
  },
  mounted() {
    // 组件挂载后执行
    this.fetchStudents(); // 获取学生数据
  },
  methods: {
    fetchStudents() {
      // 方法：获取学生数据
      this.loading = true; // 设置加载状态为 true
      axios
        .get("/api/admin/students", {
          // 发送 GET 请求到 "/api/admin/students"
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          // 设置请求头，包含 Authorization 字段，值为从 localStorage 中获取的 token
        })
        .then((response) => {
          // 请求成功
          this.students = response.data.data; // 将响应数据中的 data 字段赋值给 students
          this.totalStudents = response.data.total; // 更新总学生数
          this.loading = false; // 设置加载状态为 false
        })
        .catch((err) => {
          // 请求失败
          this.error = err.response?.data?.message || "发生未知错误"; // 将错误信息赋值给 error
          this.loading = false; // 设置加载状态为 false
        });
    },
    openResetDialog(student) {
      // 方法：打开重置密码对话框
      this.currentStudent = student; // 设置当前操作的学生对象
      this.showResetDialog = true; // 显示重置密码对话框
    },
    closeResetDialog() {
      // 方法：关闭重置密码对话框
      this.showResetDialog = false; // 隐藏重置密码对话框
      this.currentStudent = null; // 清空当前操作的学生对象
    },
    confirmResetPassword() {
      // 方法：确认重置密码
      axios
        .post(
          `/api/admin/students/${this.currentStudent.student_id}/repassword`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          if (response.data.status === 0) {
            // 如果响应状态码为 0
            ElNotification.success({ message: "重置密码成功！" }); // 显示成功通知
            this.closeResetDialog(); // 关闭重置密码对话框
          }
        })
        .catch((err) => {
          // 请求失败
          ElNotification.error({
            message: err.response?.data?.message || "重置密码失败",
          }); // 显示错误通知
        });
    },
    openDeleteDialog(student) {
      // 方法：打开删除对话框
      this.currentStudent = student; // 设置当前操作的学生对象
      this.showDeleteDialog = true; // 显示删除对话框
    },
    closeDeleteDialog() {
      // 方法：关闭删除对话框
      this.showDeleteDialog = false; // 隐藏删除对话框
      this.currentStudent = null; // 清空当前操作的学生对象
    },
    confirmDeleteStudent() {
      // 方法：确认删除学生
      axios
        .delete(`/api/admin/students/${this.currentStudent.student_id}`, {
          // 发送 DELETE 请求到 "/api/admin/students/:student_id"
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          // 设置请求头，包含 Authorization 字段，值为从 localStorage 中获取的 token
        })
        .then((response) => {
          // 请求成功
          if (response.data.status === 0) {
            // 如果响应状态码为 0
            ElNotification.success({ message: "删除学生成功！" }); // 显示成功通知
            this.fetchStudents(); // 重新获取学生数据
            this.closeDeleteDialog(); // 关闭删除对话框
          }
        })
        .catch((err) => {
          // 请求失败
          ElNotification.error({
            message: err.response?.data?.message || "删除学生失败",
          }); // 显示错误通知
        });
    },
    openBatchResetDialog() {
      // 方法：打开批量重置密码对话框
      this.showBatchResetDialog = true; // 显示批量重置密码对话框
    },
    closeBatchResetDialog() {
      // 方法：关闭批量重置密码对话框
      this.showBatchResetDialog = false; // 隐藏批量重置密码对话框
    },
    confirmBatchResetPassword() {
      // 方法：确认批量重置密码
      const requests = this.selectedStudents.map((studentId) =>
        // 使用 map 方法遍历选择的学生ID列表
        axios.post(
          `/api/admin/students/${studentId}/repassword`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
      );

      Promise.all(requests)
        // 使用 Promise.all 方法并行发送多个请求
        .then(() => {
          // 所有请求成功
          ElNotification.success({ message: "批量重置密码成功！" }); // 显示成功通知
          this.closeBatchResetDialog(); // 关闭批量重置密码对话框
          this.selectedStudents = []; // 清空选择的学生ID列表
        })
        .catch((err) => {
          // 至少一个请求失败
          ElNotification.error({
            message: err.response?.data?.message || "部分学生重置密码失败",
          }); // 显示错误通知
        });
    },
    openBatchDeleteDialog() {
      // 方法：打开批量删除对话框
      this.showBatchDeleteDialog = true; // 显示批量删除对话框
    },
    closeBatchDeleteDialog() {
      // 方法：关闭批量删除对话框
      this.showBatchDeleteDialog = false; // 隐藏批量删除对话框
    },
    confirmBatchDeleteStudents() {
      // 方法：确认批量删除学生
      const requests = this.selectedStudents.map((studentId) =>
        // 使用 map 方法遍历选择的学生ID列表
        axios.delete(`/api/admin/students/${studentId}`, {
          // 发送 DELETE 请求到 "/api/admin/students/:student_id"
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          // 设置请求头，包含 Authorization 字段，值为从 localStorage 中获取的 token
        })
      );

      Promise.all(requests)
        // 使用 Promise.all 方法并行发送多个请求
        .then(() => {
          // 所有请求成功
          ElNotification.success({ message: "批量删除学生成功！" }); // 显示成功通知
          this.fetchStudents(); // 重新获取学生数据
          this.closeBatchDeleteDialog(); // 关闭批量删除对话框
          this.selectedStudents = []; // 清空选择的学生ID列表
        })
        .catch((err) => {
          // 至少一个请求失败
          ElNotification.error({
            message: err.response?.data?.message || "部分学生删除失败",
          }); // 显示错误通知
        });
    },
    toggleSelectAll() {
      // 方法：切换全选状态
      const currentPageIds = this.paginatedStudents.map(
        // 使用 map 方法遍历当前页的学生列表
        (student) => student.student_id // 获取学生ID
      );

      if (this.isAllSelected) {
        // 如果当前是全选状态
        this.selectedStudents = this.selectedStudents.filter(
          // 使用 filter 方法过滤选择的学生ID列表
          (id) => !currentPageIds.includes(id) // 移除当前页的学生ID
        );
      } else {
        // 如果当前不是全选状态
        this.selectedStudents = [
          // 创建一个新的选择的学生ID列表
          ...new Set([...this.selectedStudents, ...currentPageIds]), // 将当前选择的学生ID列表和当前页的学生ID列表合并，并使用 Set 去重
        ];
      }
    },
    prevPage() {
      // 方法：切换到上一页
      if (this.currentPage > 1) this.currentPage--; // 如果当前页码大于 1，则减 1
    },
    nextPage() {
      // 方法：切换到下一页
      if (this.currentPage < this.totalPages) this.currentPage++; // 如果当前页码小于总页数，则加 1
    },
  },
};
</script>

<style scoped>
/* 学生管理容器样式 */
.admin-student-container {
  background: white; /* 背景颜色 */
  padding: 24px; /* 内边距 */
  border-radius: 8px; /* 边框圆角 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* 阴影 */
  margin: 0px; /* 外边距 */
  font-family: "Segoe UI", system-ui, sans-serif; /* 字体 */
}

.section-title {
  color: #2c3e50; /* 字体颜色 */
  font-size: 1.5rem; /* 字体大小 */
  margin-bottom: 1.5rem; /* 底部外边距 */
  padding-bottom: 0.8rem; /* 底部内边距 */
  border-bottom: 2px solid #42b983; /* 底部边框 */
}

.filters {
  display: flex; /* 使用 flex 布局 */
  gap: 15px; /* 间距 */
  margin-bottom: 20px; /* 底部外边距 */
}

.search-input {
  flex: 1; /* 占据剩余空间 */
  max-width: 300px; /* 最大宽度 */
  padding: 8px 12px; /* 内边距 */
  border: 1px solid #e9ecef; /* 边框 */
  border-radius: 4px; /* 边框圆角 */
}

.form-control {
  padding: 8px 12px; /* 内边距 */
  border: 1px solid #e9ecef; /* 边框 */
  border-radius: 4px; /* 边框圆角 */
  background: #f8f9fa; /* 背景颜色 */
}

.batch-btn {
  padding: 8px 16px; /* 内边距 */
  background-color: #42b983; /* 背景颜色 */
  color: white; /* 字体颜色 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 边框圆角 */
  cursor: pointer; /* 鼠标指针样式 */
  transition: background 0.2s; /* 过渡效果 */
}

.batch-btn.delete-btn {
  background-color: #f44336; /* 背景颜色 */
}

.batch-btn:hover:not(:disabled) {
  background-color: #3aa876; /* 鼠标悬停时的背景颜色 */
}

.batch-btn.delete-btn:hover:not(:disabled) {
  background-color: #d32f2f; /* 鼠标悬停时的背景颜色 */
}

.batch-btn:disabled {
  background-color: #e9ecef; /* 背景颜色 */
  color: #adb5bd; /* 字体颜色 */
  cursor: not-allowed; /* 鼠标指针样式 */
}

.data-container {
  background-color: #f8f9fa; /* 背景颜色 */
  border-radius: 6px; /* 边框圆角 */
  padding: 16px; /* 内边距 */
}

.data-list {
  display: flex; /* 使用 flex 布局 */
  flex-direction: column; /* 垂直排列 */
  gap: 8px; /* 间距 */
}

.table-header {
  display: grid; /* 使用 grid 布局 */
  grid-template-columns: 50px 100px 150px 150px 150px 150px 200px 150px; /* 列宽 */
  gap: 10px; /* 间距 */
  padding: 12px; /* 内边距 */
  background: white; /* 背景颜色 */
  border-radius: 4px; /* 边框圆角 */
  margin-bottom: 8px; /* 底部外边距 */
  font-weight: 500; /* 字体粗细 */
  color: #2c3e50; /* 字体颜色 */
}

.header-cell {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  text-align: center; /* 文本居中 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 文本溢出时显示省略号 */
  white-space: nowrap; /* 文本不换行 */
}

.data-item {
  display: grid; /* 使用 grid 布局 */
  grid-template-columns: 50px 100px 150px 150px 150px 150px 200px 150px; /* 列宽 */
  gap: 10px; /* 间距 */
  padding: 12px; /* 内边距 */
  background: white; /* 背景颜色 */
  border-radius: 4px; /* 边框圆角 */
  margin-bottom: 8px; /* 底部外边距 */
  transition: all 0.2s; /* 过渡效果 */
}

.data-item:hover {
  transform: translateY(-2px); /* 鼠标悬停时向上移动 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 鼠标悬停时显示阴影 */
}

.cell {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  color: #6c757d; /* 字体颜色 */
  font-size: 0.9rem; /* 字体大小 */
  overflow: hidden; /* 溢出隐藏 */
  text-overflow: ellipsis; /* 文本溢出时显示省略号 */
  white-space: nowrap; /* 文本不换行 */
}

.action-btn {
  padding: 6px 12px; /* 内边距 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 边框圆角 */
  cursor: pointer; /* 鼠标指针样式 */
  transition: background 0.2s; /* 过渡效果 */
  margin-right: 8px; /* 右侧外边距 */
}

.reset-btn {
  background: #4caf50; /* 背景颜色 */
  color: white; /* 字体颜色 */
}

.delete-btn {
  background: #f44336; /* 背景颜色 */
  color: white; /* 字体颜色 */
}

.action-btn:hover {
  opacity: 0.9; /* 鼠标悬停时透明度 */
}

.status-message {
  text-align: center; /* 文本居中 */
  padding: 24px; /* 内边距 */
  color: #6c757d; /* 字体颜色 */
}

.pagination-controls {
  display: flex; /* 使用 flex 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  gap: 20px; /* 间距 */
  margin-top: 20px; /* 顶部外边距 */
  padding: 10px; /* 内边距 */
}

.pagination-btn {
  padding: 8px 16px; /* 内边距 */
  background-color: #42b983; /* 背景颜色 */
  color: white; /* 字体颜色 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 边框圆角 */
  cursor: pointer; /* 鼠标指针样式 */
  transition: background 0.2s; /* 过渡效果 */
}

.pagination-btn:hover:not(:disabled) {
  background-color: #3aa876; /* 鼠标悬停时的背景颜色 */
}

.pagination-btn:disabled {
  background-color: #e9ecef; /* 背景颜色 */
  color: #adb5bd; /* 字体颜色 */
  cursor: not-allowed; /* 鼠标指针样式 */
}

.page-info {
  color: #6c757d; /* 字体颜色 */
  font-size: 0.9rem; /* 字体大小 */
}

.dialog-mask {
  position: fixed; /* 固定定位 */
  top: 0; /* 顶部距离 */
  left: 0; /* 左侧距离 */
  right: 0; /* 右侧距离 */
  bottom: 0; /* 底部距离 */
  background: rgba(0, 0, 0, 0.5); /* 背景颜色，带有透明度 */
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  z-index: 1000; /* z轴索引 */
}

.dialog-wrapper {
  background: white; /* 背景颜色 */
  border-radius: 8px; /* 边框圆角 */
  padding: 20px; /* 内边距 */
  min-width: 400px; /* 最小宽度 */
}

.dialog-header {
  display: flex; /* 使用 flex 布局 */
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中 */
  margin-bottom: 15px; /* 底部外边距 */
}

.close-btn {
  border: none; /* 无边框 */
  background: none; /* 无背景颜色 */
  font-size: 24px; /* 字体大小 */
  cursor: pointer; /* 鼠标指针样式 */
}

.action-buttons {
  display: flex; /* 使用 flex 布局 */
  justify-content: flex-end; /* 水平右对齐 */
  gap: 10px; /* 间距 */
  margin-top: 20px; /* 顶部外边距 */
}

.btn {
  padding: 8px 20px; /* 内边距 */
  border-radius: 4px; /* 边框圆角 */
  cursor: pointer; /* 鼠标指针样式 */
  border: 1px solid transparent; /* 边框 */
  transition: border-color 0.2s, background-color 0.2s; /* 过渡效果 */
}

.btn.cancel {
  /* 取消按钮样式 */
  background: #e9ecef; /* 背景颜色 */
  color: #495057; /* 字体颜色 */
  border-color: #ced4da; /* 边框颜色 */
}

.btn.confirm {
  /* 确认按钮样式 */
  background: #28a745; /* 背景颜色 */
  color: white; /* 字体颜色 */
}

.btn.cancel:hover {
  /* 取消按钮鼠标悬停样式 */
  border-color: #adb5bd; /* 边框颜色 */
}

.btn.confirm:hover {
  /* 确认按钮鼠标悬停样式 */
  background: #218838; /* 背景颜色 */
}

/* 列宽样式 */
.checkbox-col {
  width: 50px; /* 复选框列宽度 */
}

.id-col {
  width: 100px; /* ID列宽度 */
}

.name-col {
  width: 150px; /* 姓名列宽度 */
}

.faculty-col {
  width: 150px; /* 学院列宽度 */
}

.class-name-col {
  width: 150px; /* 班级列宽度 */
}

.phone-col {
  width: 150px; /* 电话列宽度 */
}

.email-col {
  width: 200px; /* 邮箱列宽度 */
}

.actions-col {
  width: 150px; /* 操作列宽度 */
}

/* 状态信息样式 */
.status-message.loading {
  /* 加载状态信息样式 */
  color: #17a2b8; /* 字体颜色 */
}

.status-message.error {
  /* 错误状态信息样式 */
  color: #dc3545; /* 字体颜色 */
}

.status-message.empty {
  /* 空数据状态信息样式 */
  color: #6c757d; /* 字体颜色 */
}

/* 统计容器样式 */
.stats-container {
  display: flex; /* 使用 flex 布局 */
  gap: 20px; /* 间距 */
  margin-bottom: 20px; /* 底部外边距 */
}

/* 统计项样式 */
.stat-item {
  display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  font-size: 0.9rem; /* 字体大小 */
  padding: 8px 12px; /* 内边距 */
  border-radius: 4px; /* 边框圆角 */
  color: #6c757d; /* 字体颜色 */
}

/* 统计标签样式 */
.stat-label {
  font-weight: 500; /* 字体粗细 */
  margin-right: 4px; /* 右侧外边距 */
}

/* 统计值样式 */
.stat-value {
  font-weight: 600; /* 字体粗细 */
}
</style>
