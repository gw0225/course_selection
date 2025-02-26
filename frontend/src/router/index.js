import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/Login.vue'
import Reg from '@/components/Reg.vue'
import StudentHome from '@/components/StudentHome.vue'
import TeacherHome from '@/components/TeacherHome.vue'
import AdminHome from '@/components/AdminHome.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/reg',
    name: 'Reg',
    component: Reg
  },
  {
    path: '/student-home',
    name: 'StudentHome',
    component: StudentHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/teacher-home',
    name: 'TeacherHome',
    component: TeacherHome,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin-home',
    name: 'AdminHome',
    component: AdminHome,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
