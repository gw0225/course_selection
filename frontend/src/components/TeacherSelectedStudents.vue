<template>
  <div class="teacher-container">
    <h1 class="section-title">已选学生管理</h1>

    <!-- 筛选栏 -->
    <div class="filters">
      <div class="filter-group">
        <select
          v-model="selectedCourseId"
          class="form-control"
          @change="loadStudents"
        >
          <option value="all">全部课程</option>
          <option
            v-for="course in teacherCourses"
            :key="course.course_id"
            :value="course.course_id"
          >
            {{ course.course_name }}(ID:{{ course.course_id }})
          </option>
        </select>
      </div>

      <input
        type="text"
        v-model="searchText"
        placeholder="输入姓名、学号或学院"
        class="search-input"
        @input="filterStudents"
      />
    </div>

    <!-- 统计信息 -->
    <div class="stats-container">
      <div class="stat-item">
        <span class="stat-label">👥总学生数：</span>
        <span class="stat-value">{{ totalStudents }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">🔍当前筛选：</span>
        <span class="stat-value">{{ filteredStudents.length }}</span>
      </div>
    </div>

    <!-- 数据表格 -->
    <div v-if="loading" class="status-message loading">⏳ 数据加载中...</div>
    <div v-else-if="error" class="status-message error">❌ {{ error }}</div>
    <div v-else class="data-container">
      <div class="data-list">
        <div class="table-header">
          <div class="header-cell">学号</div>
          <div class="header-cell">姓名</div>
          <div class="header-cell">性别</div>
          <div class="header-cell">学院</div>
          <div class="header-cell">班级</div>
          <div class="header-cell">联系方式</div>
          <div class="header-cell">所选课程</div>
          <div class="header-cell">操作</div>
        </div>

        <div
          v-for="student in paginatedStudents"
          :key="student.student_id"
          class="data-item"
        >
          <div class="cell">{{ student.student_id }}</div>
          <div class="cell">{{ student.name }}</div>
          <div class="cell">{{ student.gender }}</div>
          <div class="cell">{{ student.faculty }}</div>
          <div class="cell">{{ student.class_name }}</div>
          <div class="cell contact-cell">
            <div>{{ student.contact.phone }}</div>
            <div>{{ student.contact.email }}</div>
          </div>
          <div class="cell courses-cell">
            <div
              v-for="course in student.selected_courses"
              :key="course.course_id"
              class="course-tag"
            >
              {{ course.course_name }}(ID:{{ course.course_id }})
            </div>
          </div>
          <div class="cell">
            <button class="action-btn" @click="openDialog(student)">
              退选
            </button>
          </div>
        </div>

        <div v-if="!filteredStudents.length" class="status-message empty">
          🕳️ 未找到匹配学生
        </div>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-controls">
        <button
          class="pagination-btn"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages || 1 }} 页
        </span>
        <button
          class="pagination-btn"
          @click="nextPage"
          :disabled="currentPage === totalPages || totalPages === 0"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 退选对话框 -->
    <div v-if="showDialog" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-wrapper">
        <div class="dialog-header">
          <h3>退选操作 - 学生 {{ currentStudent?.student_id }}</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>

        <div class="dialog-body">
          <div class="select-all">
            <label class="checkbox">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="toggleSelectAll"
              />
              <span class="checkmark"></span>
              全选
            </label>
          </div>

          <div class="selection-list">
            <div
              v-for="course in currentStudent?.selected_courses"
              :key="course.course_id"
              class="course-item"
            >
              <label class="checkbox">
                <input
                  type="checkbox"
                  v-model="selectedCourses"
                  :value="course.course_id"
                />
                <span class="checkmark"></span>
                {{ course.course_name }}(ID:{{ course.course_id }})
              </label>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn cancel" @click="closeDialog">取消</button>
            <button class="btn confirm" @click="confirmDeselect">
              确认退选
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElNotification } from 'element-plus'; // 导入Element Plus的通知组件

export default {
  // 数据定义区：存储组件状态
  data() {
    return {
      teacherCourses: [],     // 教师所授课程列表（从接口获取）
      rawStudents: [],        // 原始学生数据（未过滤）
      filteredStudents: [],   // 过滤后的学生数据（用于展示）
      selectedCourseId: 'all',// 当前选中课程ID（默认"all"表示全部课程）
      searchText: '',         // 搜索关键词（支持学号/姓名/学院模糊匹配）
      loading: false,         // 数据加载状态（控制加载动画）
      error: null,            // 错误信息（用于错误提示）
      totalStudents: 0,       // 去重后的学生总数（后端数据响应后更新）
      showDialog: false,      // 控制退选对话框显示状态
      currentStudent: null,   // 当前操作的学生的完整数据
      selectedCourses: [],    // 对话框中选中的课程ID数组
      currentPage: 1,         // 当前分页页码（从1开始）
      pageSize: 5             // 每页显示数据量（可配置项）
    };
  },

  // 计算属性区：动态计算派生数据
  computed: {
    // 判断是否全选当前学生的所有课程
    isAllSelected() {
      return (
        this.currentStudent?.selected_courses?.length === 
        this.selectedCourses.length
      );
    },
    // 计算总页数（基于过滤后的数据）
    totalPages() {
      return Math.ceil(this.filteredStudents.length / this.pageSize);
    },
    // 获取当前页的数据切片
    paginatedStudents() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredStudents.slice(start, end); // 数组切片实现分页
    }
  },

  // 生命周期钩子：组件挂载时执行
  mounted() {
    this.fetchCourses();   // 初始化获取教师课程列表
    this.loadStudents();   // 初始化加载学生数据
  },

  // 方法区：定义组件功能逻辑
  methods: {
    // 核心方法：获取教师课程列表
    // 用途：填充课程筛选下拉框
    fetchCourses() {
      axios
        .get('/api/teacher/courses', {
          headers: { 
            // JWT鉴权：从localStorage获取token
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        })
        .then((response) => {
          this.teacherCourses = response.data.data; // 更新课程数据
        })
        .catch(() => {
          this.error = '课程加载失败'; // 统一错误处理
        });
    },

    // 核心方法：加载学生数据
    // 流程：1.显示加载状态 → 2.请求数据 → 3.处理响应 → 4.更新状态
    loadStudents() {
      this.loading = true; // 显示加载动画
      axios
        .get('/api/teacher/selected-students', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then((response) => {
          // 存储原始数据
          this.rawStudents = response.data.data.students;
          // 去重后的学生总数
          this.totalStudents = response.data.data.total;
          // 执行筛选逻辑
          this.filterStudents();
          // 重置到第一页
          this.currentPage = 1;
        })
        .catch(() => {
          this.error = '数据加载失败'; 
        })
        .finally(() => {
          this.loading = false; // 关闭加载状态
        });
    },

    // 核心方法：复合筛选逻辑
    // 流程：1.按课程筛选 → 2.按关键词筛选
    filterStudents() {
      // 第一阶段：课程筛选
      let filteredByCourse = this.rawStudents;
      if (this.selectedCourseId !== 'all') {
        filteredByCourse = this.rawStudents.filter((student) =>
          // 使用some()判断学生是否选了目标课程
          student.selected_courses.some(
            (c) => c.course_id == this.selectedCourseId
          )
        );
      }

      // 第二阶段：关键词筛选（不区分大小写）
      const keyword = this.searchText.toLowerCase();
      this.filteredStudents = filteredByCourse.filter((student) =>
        // 在学号、姓名、学院字段中搜索
        [student.student_id, student.name, student.faculty].some(
          (field) => field?.toLowerCase().includes(keyword)
        )
      );

      this.currentPage = 1; // 重置分页
    },

    // 对话框操作方法
    openDialog(student) {
      this.currentStudent = student; // 存储当前学生对象
      this.selectedCourses = [];     // 清空已选课程
      this.showDialog = true;        // 显示对话框
    },

    closeDialog() {
      this.showDialog = false;       // 隐藏对话框
      this.currentStudent = null;    // 释放内存
      this.selectedCourses = [];     // 重置选择
    },

    // 全选/取消全选逻辑
    toggleSelectAll(event) {
      this.selectedCourses = event.target.checked
        ? this.currentStudent.selected_courses.map((c) => c.course_id) // 全选时提取所有课程ID
        : []; // 取消全选时清空数组
    },

    // 核心方法：执行退选操作
    // 流程：1.验证选择 → 2.确认提示 → 3.批量请求 → 4.处理结果
    confirmDeselect() {
      // 验证是否选择课程
      if (!this.selectedCourses.length) {
        ElNotification({
          title: '警告',
          message: '请选择要退选的课程',
          type: 'warning'
        });
        return;
      }

      // 二次确认对话框
      if (!confirm(`确定要退选 ${this.selectedCourses.length} 门课程吗？`)) return;

      // 创建批量请求数组
      const requests = this.selectedCourses.map((courseId) =>
        axios.post(
          '/api/teacher/force-deselect',
          {
            student_id: this.currentStudent.student_id,
            course_id: courseId
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        )
      );

      // 并行发送所有请求
      Promise.all(requests)
        .then(() => {
          // 成功反馈
          ElNotification({
            title: '成功',
            message: '退选操作成功',
            type: 'success',
            duration: 2500
          });
          // 刷新数据
          this.loadStudents();
          // 关闭对话框
          this.closeDialog();
        })
        .catch((error) => {
          // 错误处理
          ElNotification({
            title: '错误',
            message: error.response?.data?.message || '部分课程退选失败',
            type: 'error',
            duration: 3000
          });
        });
    },

    // 分页控制方法
    prevPage() {
      if (this.currentPage > 1) this.currentPage--; // 确保不越界
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++; // 确保不越界
    }
  }
};
</script>

<style scoped>
/* 教师容器样式 */
.teacher-container {
  background: white; /* 背景颜色为白色 */
  padding: 24px; /* 内边距为24px */
  border-radius: 8px; /* 圆角半径为8px */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
  margin: 0px; /* 外边距为0 */
  font-family: "Segoe UI", system-ui, sans-serif; /* 设置字体 */
}

/* 部分标题样式 */
.section-title {
  color: #2c3e50; /* 字体颜色为深蓝色 */
  font-size: 1.5rem; /* 字体大小为1.5rem */
  margin-bottom: 1.5rem; /* 下边距为1.5rem */
  padding-bottom: 0.8rem; /* 下内边距为0.8rem */
  border-bottom: 2px solid #42b983; /* 底部边框为2px的绿色 */
}

/* 筛选栏样式 */
.filters {
  display: flex; /* 使用flex布局 */
  gap: 15px; /* 子元素之间的间距为15px */
  margin-bottom: 20px; /* 下边距为20px */
}

/* 表单控件样式 */
.form-control {
  padding: 8px 12px; /* 内边距为8px 12px */
  border: 1px solid #e9ecef; /* 边框为1px的浅灰色 */
  border-radius: 4px; /* 圆角半径为4px */
  background: #f8f9fa; /* 背景颜色为浅灰色 */
}

/* 搜索输入框样式 */
.search-input {
  flex: 1; /* 占据剩余空间 */
  max-width: 300px; /* 最大宽度为300px */
  padding: 8px 12px; /* 内边距为8px 12px */
  border: 1px solid #e9ecef; /* 边框为1px的浅灰色 */
  border-radius: 4px; /* 圆角半径为4px */
}

/* 数据容器样式 */
.data-container {
  background-color: #f8f9fa; /* 背景颜色为浅灰色 */
  border-radius: 6px; /* 圆角半径为6px */
  padding: 16px; /* 内边距为16px */
}

/* 表格头部样式 */
.table-header {
  display: grid; /* 使用grid布局 */
  grid-template-columns: 120px 100px 80px 140px 100px 160px 1fr 100px; /* 定义列宽 */
  gap: 10px; /* 列之间的间距为10px */
  padding: 12px; /* 内边距为12px */
  background: white; /* 背景颜色为白色 */
  border-radius: 4px; /* 圆角半径为4px */
  margin-bottom: 8px; /* 下边距为8px */
  font-weight: 500; /* 字体粗细为500 */
  color: #2c3e50; /* 字体颜色为深蓝色 */
}

/* 表头单元格样式 */
.header-cell {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  text-align: center; /* 文本居中 */
}

/* 数据项样式 */
.data-item {
  display: grid; /* 使用grid布局 */
  grid-template-columns: 120px 100px 80px 140px 100px 160px 1fr 100px; /* 定义列宽 */
  gap: 10px; /* 列之间的间距为10px */
  padding: 12px; /* 内边距为12px */
  background: white; /* 背景颜色为白色 */
  border-radius: 4px; /* 圆角半径为4px */
  margin-bottom: 8px; /* 下边距为8px */
  transition: all 0.2s; /* 添加过渡效果 */
}

/* 数据项悬停效果 */
.data-item:hover {
  transform: translateY(-2px); /* 向上移动2px */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

/* 单元格样式 */
.cell {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  color: #6c757d; /* 字体颜色为灰色 */
  font-size: 0.9rem; /* 字体大小为0.9rem */
}

/* 联系方式单元格样式 */
.contact-cell {
  display: flex; /* 使用flex布局 */
  flex-direction: column; /* 垂直排列子元素 */
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
}

/* 联系方式单元格内部div样式 */
.contact-cell div {
  margin: 2px 0; /* 上下边距为2px */
}

/* 课程单元格样式 */
.courses-cell {
  display: flex; /* 使用flex布局 */
  flex-direction: column; /* 垂直排列子元素 */
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
}

/* 课程标签样式 */
.course-tag {
  background: #f1f5f9; /* 背景颜色为浅灰色 */
  padding: 4px 8px; /* 内边距为4px 8px */
  border-radius: 4px; /* 圆角半径为4px */
  font-size: 0.85rem; /* 字体大小为0.85rem */
  margin: 2px 0; /* 上下边距为2px */
}

/* 操作按钮样式 */
.action-btn {
  background: #ff6b6b; /* 背景颜色为红色 */
  color: white; /* 字体颜色为白色 */
  padding: 6px 12px; /* 内边距为6px 12px */
  border: none; /* 无边框 */
  border-radius: 4px; /* 圆角半径为4px */
  cursor: pointer; /* 鼠标指针为手型 */
  transition: background 0.2s; /* 添加背景颜色过渡效果 */
}

/* 操作按钮悬停效果 */
.action-btn:hover {
  background: #ff5252; /* 背景颜色变为深红色 */
}

/* 状态消息样式 */
.status-message {
  text-align: center; /* 文本居中 */
  padding: 24px; /* 内边距为24px */
  color: #6c757d; /* 字体颜色为灰色 */
}

/* 统计信息容器样式 */
.stats-container {
  display: flex; /* 使用flex布局 */
  gap: 20px; /* 子元素之间的间距为20px */
  margin-bottom: 20px; /* 下边距为20px */
}

/* 统计项样式 */
.stat-item {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
  font-size: 0.9rem; /* 字体大小为0.9rem */
  color: #6c757d; /* 字体颜色为灰色 */
}

/* 统计标签样式 */
.stat-label {
  font-weight: 500; /* 字体粗细为500 */
  margin-right: 4px; /* 右边距为4px */
}

/* 统计值样式 */
.stat-value {
  font-weight: 600; /* 字体粗细为600 */
}

/* 分页控件样式 */
.pagination-controls {
  display: flex; /* 使用flex布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  gap: 20px; /* 子元素之间的间距为20px */
  margin-top: 20px; /* 上边距为20px */
  padding: 10px; /* 内边距为10px */
}

/* 分页按钮样式 */
.pagination-btn {
  padding: 8px 16px; /* 内边距为8px 16px */
  background-color: #42b983; /* 背景颜色为绿色 */
  color: white; /* 字体颜色为白色 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 圆角半径为4px */
  cursor: pointer; /* 鼠标指针为手型 */
  transition: background 0.2s; /* 添加背景颜色过渡效果 */
}

/* 分页按钮悬停效果 */
.pagination-btn:hover:not(:disabled) {
  background-color: #3aa876; /* 背景颜色变为深绿色 */
}

/* 分页按钮禁用状态样式 */
.pagination-btn:disabled {
  background-color: #e9ecef; /* 背景颜色为浅灰色 */
  color: #adb5bd; /* 字体颜色为灰色 */
  cursor: not-allowed; /* 鼠标指针为不可用 */
}

/* 分页信息样式 */
.page-info {
  color: #6c757d; /* 字体颜色为灰色 */
  font-size: 0.9rem; /* 字体大小为0.9rem */
}

/* 对话框遮罩样式 */
.dialog-mask {
  position: fixed; /* 固定定位 */
  top: 0; /* 顶部对齐 */
  left: 0; /* 左侧对齐 */
  right: 0; /* 右侧对齐 */
  bottom: 0; /* 底部对齐 */
  background: rgba(0, 0, 0, 0.5); /* 背景颜色为半透明黑色 */
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  z-index: 1000; /* 设置z-index为1000 */
}

/* 对话框容器样式 */
.dialog-wrapper {
  background: white; /* 背景颜色为白色 */
  border-radius: 12px; /* 圆角半径为12px */
  width: 600px; /* 宽度为600px */
  max-height: 80vh; /* 最大高度为视口的80% */
  display: flex; /* 使用flex布局 */
  flex-direction: column; /* 垂直排列子元素 */
}

/* 对话框头部样式 */
.dialog-header {
  padding: 20px; /* 内边距为20px */
  border-bottom: 1px solid #eee; /* 底部边框为1px的浅灰色 */
  display: flex; /* 使用flex布局 */
  justify-content: space-between; /* 子元素之间间距均匀分布 */
  align-items: center; /* 垂直居中 */
}

/* 对话框标题样式 */
.dialog-header h3 {
  margin: 0; /* 外边距为0 */
  font-size: 18px; /* 字体大小为18px */
  color: #333; /* 字体颜色为深灰色 */
}

/* 关闭按钮样式 */
.close-btn {
  border: none; /* 无边框 */
  background: none; /* 无背景 */
  font-size: 24px; /* 字体大小为24px */
  cursor: pointer; /* 鼠标指针为手型 */
  color: #666; /* 字体颜色为灰色 */
  padding: 0 8px; /* 内边距为0 8px */
}

/* 关闭按钮悬停效果 */
.close-btn:hover {
  color: #333; /* 字体颜色变为深灰色 */
}

/* 对话框主体样式 */
.dialog-body {
  padding: 20px; /* 内边距为20px */
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 垂直方向溢出时显示滚动条 */
}

/* 全选区域样式 */
.select-all {
  padding: 12px; /* 内边距为12px */
  border-bottom: 1px solid #eee; /* 底部边框为1px的浅灰色 */
  margin-bottom: 12px; /* 下边距为12px */
}

/* 全选复选框样式 */
.select-all .checkbox {
  font-weight: 500; /* 字体粗细为500 */
}

/* 选择列表样式 */
.selection-list {
  margin-bottom: 20px; /* 下边距为20px */
}

/* 课程项样式 */
.course-item {
  padding: 12px; /* 内边距为12px */
  border-radius: 6px; /* 圆角半径为6px */
  margin-bottom: 8px; /* 下边距为8px */
  transition: background 0.2s; /* 添加背景颜色过渡效果 */
}

/* 课程项悬停效果 */
.course-item:hover {
  background: #f8fafc; /* 背景颜色变为浅灰色 */
}

/* 复选框样式 */
.checkbox {
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
  cursor: pointer; /* 鼠标指针为手型 */
  user-select: none; /* 禁止用户选择文本 */
}

/* 复选框输入框样式 */
.checkbox input {
  position: absolute; /* 绝对定位 */
  opacity: 0; /* 透明度为0 */
  cursor: pointer; /* 鼠标指针为手型 */
}

/* 复选框标记样式 */
.checkmark {
  position: relative; /* 相对定位 */
  height: 18px; /* 高度为18px */
  width: 18px; /* 宽度为18px */
  border: 2px solid #ccc; /* 边框为2px的灰色 */
  border-radius: 4px; /* 圆角半径为4px */
  margin-right: 12px; /* 右边距为12px */
}

/* 复选框选中状态样式 */
.checkbox input:checked ~ .checkmark {
  background: #42b983; /* 背景颜色为绿色 */
  border-color: #42b983; /* 边框颜色为绿色 */
}

/* 复选框标记选中后的样式 */
.checkmark:after {
  content: ""; /* 内容为空 */
  position: absolute; /* 绝对定位 */
  left: 5px; /* 左侧距离为5px */
  top: 1px; /* 顶部距离为1px */
  width: 4px; /* 宽度为4px */
  height: 10px; /* 高度为10px */
  border: solid white; /* 边框为白色 */
  border-width: 0 2px 2px 0; /* 边框宽度 */
  transform: rotate(45deg); /* 旋转45度 */
  opacity: 0; /* 透明度为0 */
}

/* 复选框选中后显示标记 */
.checkbox input:checked ~ .checkmark:after {
  opacity: 1; /* 透明度为1 */
}

/* 操作按钮区域样式 */
.action-buttons {
  display: flex; /* 使用flex布局 */
  justify-content: flex-end; /* 子元素靠右对齐 */
  gap: 12px; /* 子元素之间的间距为12px */
  padding-top: 20px; /* 上内边距为20px */
  border-top: 1px solid #eee; /* 顶部边框为1px的浅灰色 */
}

/* 按钮样式 */
.btn {
  padding: 8px 20px; /* 内边距为8px 20px */
  border-radius: 6px; /* 圆角半径为6px */
  cursor: pointer; /* 鼠标指针为手型 */
  font-size: 14px; /* 字体大小为14px */
  transition: all 0.2s; /* 添加过渡效果 */
}

/* 取消按钮样式 */
.btn.cancel {
  background: #f0f2f5; /* 背景颜色为浅灰色 */
  color: #666; /* 字体颜色为灰色 */
  border: 1px solid #ddd; /* 边框为1px的浅灰色 */
}

/* 取消按钮悬停效果 */
.btn.cancel:hover {
  background: #e6e8eb; /* 背景颜色变为深灰色 */
}

/* 确认按钮样式 */
.btn.confirm {
  background: #42b983; /* 背景颜色为绿色 */
  color: white; /* 字体颜色为白色 */
  border: none; /* 无边框 */
}

/* 确认按钮悬停效果 */
.btn.confirm:hover {
  background: #3aa876; /* 背景颜色变为深绿色 */
}
</style>