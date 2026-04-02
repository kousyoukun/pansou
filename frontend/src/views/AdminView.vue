<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Admin 管理</h1>
      <button 
        @click="handleLogout" 
        class="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        登出
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- 系统配置 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">系统配置</h2>
        <div class="space-y-4">
          <div>
            <label for="concurrency" class="block text-sm font-medium text-gray-700 mb-1">并发数</label>
            <input 
              type="number" 
              id="concurrency" 
              v-model.number="configForm.concurrency" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="10"
            />
          </div>
          
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="pluginsEnabled" 
              v-model="configForm.pluginsEnabled"
              class="mr-2"
            />
            <label for="pluginsEnabled" class="text-sm text-gray-700">启用插件</label>
          </div>
          
          <button 
            @click="saveConfig" 
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            :disabled="isSaving"
          >
            {{ isSaving ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </div>
      
      <!-- 插件管理 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">插件管理</h2>
        <div class="space-y-2">
          <div v-for="plugin in plugins" :key="plugin.name" class="flex items-center">
            <input 
              type="checkbox" 
              :id="plugin.name" 
              v-model="plugin.enabled"
              class="mr-2"
            />
            <label :for="plugin.name" class="text-sm text-gray-700">{{ plugin.name }}</label>
          </div>
        </div>
        <button 
          @click="savePlugins" 
          class="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          保存插件配置
        </button>
      </div>
      
      <!-- 高级搜索参数 -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">高级搜索参数</h2>
        <div class="space-y-4">
          <div>
            <label for="resultType" class="block text-sm font-medium text-gray-700 mb-1">结果类型</label>
            <select 
              id="resultType" 
              v-model="searchParams.resultType" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="merged_by_type">按类型合并</option>
              <option value="raw">原始结果</option>
            </select>
          </div>
          
          <div>
            <label for="sourceType" class="block text-sm font-medium text-gray-700 mb-1">来源类型</label>
            <select 
              id="sourceType" 
              v-model="searchParams.sourceType" 
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="tg">Telegram</option>
              <option value="plugin">插件</option>
            </select>
          </div>
          
          <button 
            @click="saveSearchParams" 
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            保存搜索参数
          </button>
        </div>
      </div>
    </div>
    
    <!-- 操作结果 -->
    <div v-if="message" class="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      {{ message }}
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
/* 组件样式 */
</style>