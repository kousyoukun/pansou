<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold text-center mb-6">Admin 登录</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入密码"
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          :disabled="isLoading"
        >
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <!-- 错误信息 -->
      <div v-if="error" class="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../utils/api'

const router = useRouter()

// 登录表单数据
const loginForm = ref({
  username: '',
  password: ''
})

// 登录状态
const isLoading = ref(false)
const error = ref('')

// 处理登录
const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    // 发送登录请求
    const response = await authApi.login(loginForm.value.username, loginForm.value.password)
    
    if (response.data.code === 200) {
      // 保存token到localStorage
      localStorage.setItem('token', response.data.data.token)
      // 跳转到Admin页面
      router.push('/admin')
    } else {
      error.value = response.data.message || '登录失败'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>