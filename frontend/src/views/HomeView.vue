<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-8">PanSou 搜索</h1>
    
    <!-- 搜索表单 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <form @submit.prevent="handleSearch" class="space-y-4">
        <div>
          <label for="keyword" class="block text-sm font-medium text-gray-700 mb-1">搜索关键词</label>
          <input 
            type="text" 
            id="keyword" 
            v-model="searchForm.keyword" 
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入搜索关键词"
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          :disabled="isLoading"
        >
          {{ isLoading ? '搜索中...' : '搜索' }}
        </button>
      </form>
    </div>
    
    <!-- 搜索结果 -->
    <div v-if="hasResults" class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">搜索结果</h2>
      
      <!-- 按类型分类展示 - Tab形式 -->
      <div v-if="Object.keys(mergedResults).length > 0">
        <!-- Tab导航 -->
        <div class="flex border-b border-gray-200 mb-4">
          <button 
            v-for="(type, index) in Object.keys(mergedResults)" 
            :key="type"
            @click="activeTab = type"
            class="px-4 py-2 font-medium"
            :class="activeTab === type ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            {{ getTypeName(type) }}
            <span class="ml-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">{{ mergedResults[type].length }}</span>
          </button>
        </div>
        
        <!-- Tab内容 -->
        <div v-if="activeTab && mergedResults[activeTab]" class="space-y-3">
          <div v-for="(result, index) in mergedResults[activeTab]" :key="index" class="border-l-2 border-blue-500 pl-4 py-1">
            <h4 class="font-medium text-blue-600">{{ result.note || '无标题' }}</h4>
            <p class="text-sm text-gray-600 mt-1">{{ result.password ? '提取码: ' + result.password : '无提取码' }}</p>
            <div class="mt-2 flex items-center">
              <a 
                :href="result.url" 
                target="_blank" 
                class="text-sm text-blue-600 hover:underline mr-4"
              >
                查看链接
              </a>
              <span class="text-xs text-gray-500">{{ result.source || '未知来源' }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 普通结果展示（当没有按类型分类时） -->
      <div v-else-if="results.length > 0" class="space-y-4">
        <div v-for="(result, index) in results" :key="index" class="border-b border-gray-200 pb-4">
          <h3 class="font-medium text-blue-600">{{ result.title }}</h3>
          <p class="text-sm text-gray-600 mt-1">{{ result.description }}</p>
          <div class="mt-2 flex items-center">
            <a 
              :href="result.url" 
              target="_blank" 
              class="text-sm text-blue-600 hover:underline mr-4"
            >
              查看链接
            </a>
            <span class="text-xs text-gray-500">{{ result.source }}</span>
          </div>
        </div>
      </div>
      
      <div class="mt-4 text-sm text-gray-500">
        搜索耗时: {{ searchTime }}ms
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

// 搜索表单数据
const searchForm = ref({
  keyword: ''
})

// 搜索状态
const isLoading = ref(false)
const results = ref([])
const mergedResults = ref({})
const activeTab = ref('')
const error = ref('')
const searchTime = ref(0)

// 计算属性：是否有搜索结果
const hasResults = computed(() => {
  return Object.keys(mergedResults.value).length > 0 || results.value.length > 0
})

// 获取类型名称
const getTypeName = (type) => {
  const typeMap = {
    'baidu': '百度网盘',
    'aliyun': '阿里云盘',
    'tencent': '腾讯微云',
    '123pan': '123云盘',
    'other': '其他'
  }
  return typeMap[type] || type
}

// 处理搜索
const handleSearch = async () => {
  isLoading.value = true
  error.value = ''
  results.value = []
  mergedResults.value = {}
  
  const startTime = Date.now()
  
  try {
    // 构建搜索参数
    const params = {
      kw: searchForm.value.keyword,
      res: 'merged_by_type' // 指定返回按类型合并的结果
    }
    
    // 发送搜索请求
    const response = await axios.get('/api/search', { params })
    
    if (response.data.code === 0) { // 后端返回code为0表示成功
      const data = response.data.data
      if (data && typeof data === 'object') {
        // 检查是否是按类型合并的结果
        if (data.merged_by_type) {
          mergedResults.value = data.merged_by_type
          // 设置默认选中的tab为第一个类型
          const types = Object.keys(data.merged_by_type)
          if (types.length > 0) {
            activeTab.value = types[0]
          }
        } else if (data.results) {
          // 兼容普通结果格式
          results.value = data.results
        } else {
          // 其他格式
          results.value = data
        }
      } else {
        results.value = data || []
      }
    } else {
      error.value = response.data.message || '搜索失败'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
    console.error(err)
  } finally {
    isLoading.value = false
    searchTime.value = Date.now() - startTime
  }
}
</script>

<style scoped>
/* 组件样式 */
</style>