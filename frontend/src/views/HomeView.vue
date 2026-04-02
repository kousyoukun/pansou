<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Logo -->
    <div class="flex items-center justify-center gap-4 mb-12">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 flex items-center justify-center relative overflow-hidden shadow-lg">
        <div class="absolute inset-1 rounded-lg bg-black"></div>
        <svg class="w-6 h-6 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <div>
        <h1 class="text-3xl font-bold text-center">PanSou 搜索</h1>
        <p class="text-sm text-gray-400 text-center">网盘资源搜索引擎</p>
      </div>
    </div>
    
    <!-- 搜索表单 -->
    <div class="max-w-2xl mx-auto mb-12">
      <div class="search-box">
        <form @submit.prevent="handleSearch" class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input 
            type="text" 
            id="keyword" 
            v-model="searchForm.keyword" 
            class="search-input"
            placeholder="搜索网盘资源..."
            required
          />
          <div class="search-actions">
            <button 
              type="submit" 
              class="search-btn"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex items-center gap-2">
                <span class="loading-spinner small"></span>
                搜索中...
              </span>
              <span v-else>搜索</span>
            </button>
          </div>
        </form>
      </div>
      
      <div class="text-center mt-6">
        <p class="text-sm text-gray-400">
          支持搜索 <span class="text-gray-300">阿里云盘</span> · <span class="text-gray-300">百度网盘</span> · <span class="text-gray-300">腾讯微云</span> · <span class="text-gray-300">123云盘</span> 资源
        </p>
      </div>
    </div>
    
    <!-- 搜索结果 -->
    <div v-if="hasResults" class="results-container">
      <div class="mb-6 animate-fadeIn">
        <p class="text-sm text-gray-400 mb-2">搜索 "{{ searchForm.keyword }}" 的结果</p>
        <p class="text-xs text-gray-500">搜索耗时: {{ searchTime }}ms</p>
      </div>
      
      <!-- 按类型分类展示 - Tab形式 -->
      <div v-if="Object.keys(mergedResults).length > 0">
        <!-- Tab导航 -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button 
            v-for="(type, index) in Object.keys(mergedResults)" 
            :key="type"
            @click="activeTab = type"
            class="filter-tab"
            :class="activeTab === type ? 'active' : ''"
          >
            {{ getTypeName(type) }}
            <span class="filter-count">{{ mergedResults[type].length }}</span>
          </button>
        </div>
        
        <!-- Tab内容 -->
        <div v-if="activeTab && mergedResults[activeTab]" class="space-y-3">
          <div v-for="(result, index) in mergedResults[activeTab]" :key="index" class="result-item animate-fadeInUp" :style="{ animationDelay: index * 0.1 + 's' }">
            <span class="result-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="result-item-info">
              <h4 class="result-item-name">{{ result.note || '无标题' }}</h4>
              <p class="result-item-detail">{{ result.password ? '提取码: ' + result.password : '无提取码' }}</p>
            </div>
            <div class="result-item-actions">
              <a 
                :href="result.url" 
                target="_blank" 
                class="result-item-link"
              >
                查看链接
              </a>
              <span class="result-item-source">{{ result.source || '未知来源' }}</span>
            </div>
            <svg class="result-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- 普通结果展示（当没有按类型分类时） -->
      <div v-else-if="results.length > 0" class="space-y-3">
        <div v-for="(result, index) in results" :key="index" class="result-item animate-fadeInUp" :style="{ animationDelay: index * 0.1 + 's' }">
          <span class="result-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="result-item-info">
            <h4 class="result-item-name">{{ result.title }}</h4>
            <p class="result-item-detail">{{ result.description }}</p>
          </div>
          <div class="result-item-actions">
            <a 
              :href="result.url" 
              target="_blank" 
              class="result-item-link"
            >
              查看链接
            </a>
            <span class="result-item-source">{{ result.source }}</span>
          </div>
          <svg class="result-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </div>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <div class="bg-glass border border-red-500/30 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
        {{ error }}
      </div>
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
/* 搜索表单样式 */
.search-box {
  position: relative;
  width: 100%;
  border-radius: var(--radius-xl);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.search-box::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-xl);
  padding: 1px;
  background: linear-gradient(135deg, transparent 0%, var(--accent-1) 50%, var(--accent-3) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.search-box:focus-within {
  border-color: transparent;
  box-shadow: var(--shadow-glow), var(--shadow-card);
  transform: translateY(-2px);
}

.search-box:focus-within::before {
  opacity: 1;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 8px 8px 8px 24px;
  gap: 12px;
}

.search-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  color: var(--text-muted);
  transition: color 0.3s ease;
}

.search-box:focus-within .search-icon {
  color: var(--accent-2);
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 400;
  color: var(--text-primary);
  padding: 14px 0;
  letter-spacing: -0.2px;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-weight: 300;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.search-btn {
  padding: 12px 28px;
  border-radius: 100px;
  border: none;
  background: var(--gradient-main);
  color: white;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: -0.2px;
  position: relative;
  overflow: hidden;
}

.search-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.search-btn:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4);
}

.search-btn:hover::before {
  opacity: 1;
}

.search-btn:active {
  transform: scale(0.98);
}

.search-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 搜索结果样式 */
.results-container {
  max-width: 800px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease-out;
}

/* 过滤标签样式 */
.filter-tab {
  padding: 8px 18px;
  border-radius: 100px;
  border: 1px solid var(--border-glass);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-tab:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-glass-hover);
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--accent-1);
  border-color: var(--accent-1);
  color: white;
}

.filter-count {
  font-size: 11px;
  opacity: 0.7;
  font-family: var(--font-mono);
}

/* 结果项样式 */
.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: var(--radius-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  transition: all 0.3s ease;
  text-decoration: none;
  backdrop-filter: blur(10px);
}

.result-item:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-glass-hover);
  transform: translateX(4px);
  box-shadow: var(--shadow-card);
}

.result-item-index {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.result-item-info {
  flex: 1;
  min-width: 0;
}

.result-item-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.result-item:hover .result-item-name {
  color: var(--accent-2);
}

.result-item-detail {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-mono);
  transition: color 0.3s ease;
}

.result-item:hover .result-item-detail {
  color: var(--text-secondary);
}

.result-item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.result-item-link {
  font-size: 12px;
  color: var(--accent-2);
  text-decoration: none;
  transition: color 0.3s ease;
}

.result-item-link:hover {
  text-decoration: underline;
}

.result-item-source {
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.result-item-arrow {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--text-muted);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-8px);
}

.result-item:hover .result-item-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--accent-2);
}

/* 错误信息样式 */
.error-message {
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-input-wrapper {
    padding: 6px 6px 6px 18px;
  }
  
  .search-input {
    font-size: 15px;
  }
  
  .search-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .result-item {
    padding: 12px 14px;
    gap: 10px;
  }
  
  .result-item-name {
    font-size: 14px;
  }
  
  .result-item-actions {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }
  
  .filter-tab {
    padding: 6px 14px;
    font-size: 12px;
  }
  
  .results-container {
    padding: 0 16px;
  }
  
  .error-message {
    padding: 0 16px;
  }
  
  .logo-container {
    flex-direction: column;
    text-align: center;
  }
  
  .logo-icon {
    margin-bottom: 8px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .search-box {
    max-width: 90vw;
  }
}

@media (max-width: 480px) {
  .search-input-wrapper {
    padding: 4px 4px 4px 12px;
  }
  
  .search-input {
    font-size: 14px;
  }
  
  .search-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .result-item {
    padding: 10px 12px;
    gap: 8px;
  }
  
  .result-item-name {
    font-size: 13px;
  }
  
  .result-item-detail {
    font-size: 11px;
  }
  
  .filter-tab {
    padding: 4px 12px;
    font-size: 11px;
  }
  
  h1 {
    font-size: 20px;
  }
  
  .search-box {
    max-width: 95vw;
  }
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-glass);
  border-top: 3px solid var(--accent-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 动画类 */
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>