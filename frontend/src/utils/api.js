import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理401错误（token过期或无效）
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除token
      localStorage.removeItem('token')
      
      // 跳转到登录页面
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authApi = {
  // 登录
  login: (username, password) => {
    return api.post('/api/auth/login', { username, password })
  },
  
  // 验证token
  verify: () => {
    return api.post('/api/auth/verify')
  },
  
  // 登出
  logout: () => {
    return api.post('/api/auth/logout')
  }
}

// 其他API
export const adminApi = {
  // 保存系统配置
  saveConfig: (config) => {
    return api.post('/api/config', config)
  },
  
  // 保存插件配置
  savePlugins: (plugins) => {
    return api.post('/api/plugins', { plugins })
  },
  
  // 保存搜索参数
  saveSearchParams: (params) => {
    return api.post('/api/search/params', params)
  }
}

export default api