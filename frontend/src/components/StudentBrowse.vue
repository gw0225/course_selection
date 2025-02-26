<template>
  <div class="student-container">
    <h1 class="section-title">课程浏览</h1>

    <!-- 搜索和筛选区域 -->
    <div class="filters">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索课程名称、教师或学院..."
        class="search-input"
      />

      <select v-model="selectedType" class="form-control">
        <option value="">全部类型</option>
        <option value="必修课">必修课</option>
        <option value="选修课">选修课</option>
        <option value="公共课">公共课</option>
      </select>

      <button 
        class="batch-btn"
        @click="openBatchDialog"
        :disabled="selectedCourses.length === 0"
      >
        批量选课
      </button>
    </div>

    <!-- 数据表格 -->
    <div v-if="loading" class="status-message loading">⏳ 数据加载中...</div>
    <div v-else-if="error" class="status-message error">❌ {{ error }}</div>
    <div v-else class="data-container">
      <div class="data-list">
        <div class="table-header">
          <div class="header-cell">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
          </div>
          <div class="header-cell">课程ID</div>
          <div class="header-cell">课程名称</div>
          <div class="header-cell">课程容量</div>
          <div class="header-cell">教师</div>
          <div class="header-cell">学院</div>
          <div class="header-cell">学分</div>
          <div class="header-cell">学时</div>
          <div class="header-cell">类型</div>
          <div class="header-cell">操作</div>
        </div>

        <div
          v-for="course in paginatedCourses"
          :key="course.courseId"
          class="data-item"
        >
          <div class="cell">
            <input
              type="checkbox"
              v-model="selectedCourses"
              :value="course.courseId"
              :disabled="course.isSelected"
            />
          </div>
          <div class="cell">{{ course.courseId }}</div>
          <div class="cell">{{ course.courseName }}</div>
          <div class="cell">{{ course.selected }}/{{ course.capacity }}</div>
          <div class="cell">{{ course.teacher.name || "未知教师" }}</div>
          <div class="cell">{{ course.teacher.department || "未知学院" }}</div>
          <div class="cell">{{ course.credits }}</div>
          <div class="cell">{{ course.classHours }}</div>
          <div class="cell">{{ course.courseType || "未分类" }}</div>
          <div class="cell">
            <button
              class="action-btn"
              :class="{ 
                'selected-button': course.isSelected || course.selected === course.capacity,
                'full-button': course.selected === course.capacity
              }"
              :disabled="course.isSelected || course.selected === course.capacity"
              @click="openSingleDialog(course)"
            >
              {{ course.isSelected ? '已选' : course.selected === course.capacity ? '已满' : '选课' }}
            </button>
          </div>
        </div>

        <div v-if="!filteredCourses.length" class="status-message empty">
          🕳️ 未找到匹配课程
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

    <!-- 选课确认对话框 -->
    <div v-if="showDialog" class="dialog-mask" @click.self="closeDialog">
      <div class="dialog-wrapper">
        <div class="dialog-header">
          <h3>确认选课操作</h3>
          <button class="close-btn" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <p v-if="dialogType === 'single'">确认选修课程 {{ currentCourse?.courseName }} ？</p>
          <p v-else>确认批量选修 {{ selectedCourses.length }} 门课程？</p>
          <div class="action-buttons">
            <button class="btn cancel" @click="closeDialog">取消</button>
            <button class="btn confirm" @click="confirmSelection">确认</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ElNotification } from "element-plus";

export default {
  data() {
    return {
      courses: [],
      loading: true,
      error: null,
      searchQuery: "",
      selectedType: "",
      currentPage: 1,
      pageSize: 5,
      selectedCourses: [],
      showDialog: false,
      dialogType: "single", 
      currentCourse: null
    };
  },
  computed: {
    filteredCourses() {
      return this.courses
        .filter((course) => {
          const matchSearch =
            course.courseName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            (course.teacher.name &&
              course.teacher.name.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
            (course.teacher.department &&
              course.teacher.department.toLowerCase().includes(this.searchQuery.toLowerCase()));

          const matchType = !this.selectedType || course.courseType === this.selectedType;

          return matchSearch && matchType;
        })
        .sort((a, b) => a.isSelected - b.isSelected);
    },
    totalPages() {
      return Math.ceil(this.filteredCourses.length / this.pageSize);
    },
    paginatedCourses() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredCourses.slice(start, end);
    },
    isAllSelected() {
      return this.paginatedCourses.every(course => 
        this.selectedCourses.includes(course.courseId) || course.isSelected
      );
    }
  },
  mounted() {
    this.fetchCourses();
  },
  methods: {
    fetchCourses() {
      this.loading = true;
      axios
        .get("/api/student/courses", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((response) => {
          this.courses = response.data.data.list;
          this.loading = false;
        })
        .catch((err) => {
          this.error = err.response?.data?.message || "发生未知错误";
          this.loading = false;
        });
    },

    openSingleDialog(course) {
      this.currentCourse = course;
      this.dialogType = "single";
      this.showDialog = true;
    },

    openBatchDialog() {
      this.dialogType = "batch";
      this.showDialog = true;
    },

    closeDialog() {
      this.showDialog = false;
      this.currentCourse = null;
    },

    confirmSelection() {
      if (this.dialogType === "single") {
        this.selectCourse(this.currentCourse);
      } else {
        this.batchSelectCourses();
      }
      this.closeDialog();
    },

    selectCourse(course) {
      axios
        .post(
          "/api/student/select-course",
          { course_id: course.courseId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        .then((response) => {
          if (response.data.status === 0) {
            ElNotification.success({ message: "选课成功！" });
            this.updateCourseStatus(course.courseId);
          }
        })
        .catch((err) => {
          ElNotification.error({
            message: err.response?.data?.message || "选课失败"
          });
        });
    },

    batchSelectCourses() {
      const requests = this.selectedCourses.map(courseId =>
        axios.post(
          "/api/student/select-course",
          { course_id: courseId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
      );

      Promise.all(requests)
        .then(() => {
          ElNotification.success({ message: "批量选课成功！" });
          this.selectedCourses.forEach(id => this.updateCourseStatus(id));
          this.selectedCourses = [];
        })
        .catch((err) => {
          ElNotification.error({
            message: err.response?.data?.message || "部分课程选课失败"
          });
        });
    },

    updateCourseStatus(courseId) {
      this.courses = this.courses.map(c =>
        c.courseId === courseId ? { ...c, isSelected: true } : c
      );
    },

    toggleSelectAll() {
      const currentPageIds = this.paginatedCourses
        .filter(c => !c.isSelected)
        .map(c => c.courseId);

      if (this.isAllSelected) {
        this.selectedCourses = this.selectedCourses.filter(
          id => !currentPageIds.includes(id)
        );
      } else {
        this.selectedCourses = [...new Set([...this.selectedCourses, ...currentPageIds])];
      }
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    }
  }
};
</script>

<style scoped>
.student-container {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin: 0px;
  font-family: "Segoe UI", system-ui, sans-serif;
}

.section-title {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #42b983;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  background: #f8f9fa;
}

.batch-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.batch-btn:hover:not(:disabled) {
  background-color: #3aa876;
}

.batch-btn:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}

.data-container {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.table-header {
  display: grid;
  grid-template-columns: 50px 100px 1fr 120px 120px 80px 80px 100px 100px 100px;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.header-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.data-item {
  display: grid;
  grid-template-columns: 50px 100px 1fr 120px 120px 80px 80px 100px 100px 100px;
  gap: 10px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.data-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.9rem;
}

.action-btn {
  background: #4caf50;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #45a049;
}

.selected-button,
.full-button {
  background: #cccccc !important;
  cursor: not-allowed;
}

.status-message {
  text-align: center;
  padding: 24px;
  color: #6c757d;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 10px;
}

.pagination-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #3aa876;
}

.pagination-btn:disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  min-width: 400px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.close-btn {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.2s, background-color 0.2s;
}

.btn.cancel {
  background: #f0f2f5;
  color: #666;
}

.btn.cancel:hover {
  border-color: black;
}

.btn.confirm {
  background: #42b983;
  color: white;
}

.btn.confirm:hover {
  border-color: black;
}

.table-header .header-cell:first-child,
.data-item .cell:first-child {
  width: 40px;
  justify-content: center;
}

input[type="checkbox"] {
  width: 16px;
  height: 16px;
}
</style>