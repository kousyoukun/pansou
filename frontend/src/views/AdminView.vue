<template>
  <div class="min-h-screen py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold text-primary">Admin 管理</h1>
        <button 
          @click="handleLogout" 
          class="btn btn-danger"
        >
          登出
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 系统配置 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4 text-primary">系统配置</h2>
          <div class="space-y-4">
            <div>
              <label for="concurrency" class="block text-sm font-medium text-secondary mb-1">并发数</label>
              <input 
                type="number" 
                id="concurrency" 
                v-model.number="configForm.concurrency" 
                class="input"
                min="1"
                max="10"
              />
            </div>
            
            <div class="flex items-center">
              <input 
                type="checkbox" 
                id="pluginsEnabled" 
                v-model="configForm.pluginsEnabled"
                class="checkbox"
              />
              <label for="pluginsEnabled" class="text-sm text-secondary ml-2">启用插件</label>
            </div>
            
            <button 
              @click="saveConfig" 
              class="btn btn-primary w-full"
              :disabled="isSaving"
            >
              {{ isSaving ? '保存中...' : '保存配置' }}
            </button>
          </div>
        </div>
        
        <!-- 插件管理 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4 text-primary">插件管理</h2>
          <div class="space-y-2">
            <div v-for="plugin in plugins" :key="plugin.name" class="flex items-center">
              <input 
                type="checkbox" 
                :id="plugin.name" 
                v-model="plugin.enabled"
                class="checkbox"
              />
              <label :for="plugin.name" class="text-sm text-secondary ml-2">{{ plugin.name }}</label>
            </div>
          </div>
          <button 
            @click="savePlugins" 
            class="btn btn-primary w-full mt-4"
          >
            保存插件配置
          </button>
        </div>
        
        <!-- 高级搜索参数 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4 text-primary">高级搜索参数</h2>
          <div class="space-y-4">
            <div>
              <label for="resultType" class="block text-sm font-medium text-secondary mb-1">结果类型</label>
              <select 
                id="resultType" 
                v-model="searchParams.resultType" 
                class="input"
              >
                <option value="merged_by_type">按类型合并</option>
                <option value="raw">原始结果</option>
              </select>
            </div>
            
            <div>
              <label for="sourceType" class="block text-sm font-medium text-secondary mb-1">来源类型</label>
              <select 
                id="sourceType" 
                v-model="searchParams.sourceType" 
                class="input"
              >
                <option value="all">全部</option>
                <option value="tg">Telegram</option>
                <option value="plugin">插件</option>
              </select>
            </div>
            
            <button 
              @click="saveSearchParams" 
              class="btn btn-primary w-full"
            >
              保存搜索参数
            </button>
          </div>
        </div>
      </div>
      
      <!-- 操作结果 -->
      <div v-if="message" class="mt-6 alert alert-success">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi, adminApi } from '../utils/api'

const router = useRouter()

// 配置表单数据
const configForm = ref({
  concurrency: 3,
  pluginsEnabled: true
})

// 插件列表
const plugins = ref([
  { name: 'pansearch', enabled: true },
  { name: 'panta', enabled: true },
  { name: 'pan666', enabled: false },
  { name: 'haisou', enabled: false }
])

// 搜索参数
const searchParams = ref({
  resultType: 'merged_by_type',
  sourceType: 'all'
})

// 状态
const isSaving = ref(false)
const message = ref('')

// 处理登出
const handleLogout = async () => {
  try {
    await authApi.logout()
  } finally {
    localStorage.removeItem('token')
    router.push('/login')
  }
}

// 保存系统配置
const saveConfig = async () => {
  isSaving.value = true
  message.value = ''
  
  try {
    // 发送保存请求
    const response = await adminApi.saveConfig(configForm.value)
    
    if (response.data.code === 200) {
      message.value = '配置保存成功'
    } else {
      message.value = '配置保存失败'
    }
  } catch (err) {
    message.value = '网络错误，请稍后重试'
    console.error(err)
  } finally {
    isSaving.value = false
  }
}

// 保存插件配置
const savePlugins = async () => {
  message.value = ''
  
  try {
    // 发送保存请求
    const enabledPlugins = plugins.value.filter(p => p.enabled).map(p => p.name)
    const response = await adminApi.savePlugins(enabledPlugins)
    
    if (response.data.code === 200) {
      message.value = '插件配置保存成功'
    } else {
      message.value = '插件配置保存失败'
    }
  } catch (err) {
    message.value = '网络错误，请稍后重试'
    console.error(err)
  }
}

// 保存搜索参数
const saveSearchParams = async () => {
  message.value = ''
  
  try {
    // 发送保存请求
    const response = await adminApi.saveSearchParams(searchParams.value)
    
    if (response.data.code === 200) {
      message.value = '搜索参数保存成功'
    } else {
      message.value = '搜索参数保存失败'
    }
  } catch (err) {
    message.value = '网络错误，请稍后重试'
    console.error(err)
  }
}

// 初始化数据
onMounted(() => {
  // 这里可以从API获取当前配置
  // 暂时使用默认值
})
</script>

<style scoped>
/* 卡片样式 */
.card {
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 1.5rem;
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

/* 复选框样式 */
.checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-1);
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

.btn-danger {
  background: var(--accent-4);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #fd5a98;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(253, 121, 168, 0.3);
}

/* 提示信息样式 */
.alert {
  padding: 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.alert-success {
  background: rgba(0, 206, 201, 0.1);
  border: 1px solid rgba(0, 206, 201, 0.3);
  color: var(--accent-3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: 1fr;
  }
  
  .md\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  h2 {
    font-size: 1.25rem;
  }
}
</style>