<template>
  <div class="min-h-screen flex items-center justify-center py-8 px-4">
    <div class="max-w-md w-full">
      <div class="card p-8">
        <h1 class="text-2xl font-bold text-center mb-8 text-primary">Admin 登录</h1>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-secondary mb-2">用户名</label>
            <input 
              type="text" 
              id="username" 
              v-model="loginForm.username" 
              class="input"
              placeholder="请输入用户名"
              required
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-secondary mb-2">密码</label>
            <input 
              type="password" 
              id="password" 
              v-model="loginForm.password" 
              class="input"
              placeholder="请输入密码"
              required
            />
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary w-full"
            :disabled="isLoading"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <!-- 错误信息 -->
        <div v-if="error" class="mt-6 alert alert-error">
          {{ error }}
        </div>
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
/* 卡片样式 */
.card {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.card:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-glass-hover);
  transform: translateY(-2px);
}

/* 文本颜色 */
.text-primary {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

/* 表单元素样式 */
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-display);
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--accent-1);
  box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.2);
}

.input::placeholder {
  color: var(--text-muted);
}

/* 按钮样式 */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-1);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
}

/* 提示信息样式 */
.alert {
  padding: 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.alert-error {
  background: rgba(253, 121, 168, 0.1);
  border: 1px solid rgba(253, 121, 168, 0.3);
  color: var(--accent-4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card {
    padding: 2rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style>