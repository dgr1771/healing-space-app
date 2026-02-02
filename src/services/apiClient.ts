/**
 * API 客户端配置
 * 基于 axios 的 HTTP 客户端
 */

import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    let errorMessage = '请求失败，请稍后重试'

    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接'
    } else if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 400:
          errorMessage = '请求数据格式错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          break
        case 403:
          errorMessage = '没有权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误，请稍后重试'
          break
        case 502:
        case 503:
        case 504:
          errorMessage = '服务暂时不可用，请稍后重试'
          break
        default:
          errorMessage = error.response.data?.message || '请求失败，请稍后重试'
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接失败，请检查网络设置'
    }

    console.error('API Error:', errorMessage, error)

    // 将错误信息附加到错误对象上，方便组件使用
    error.userMessage = errorMessage

    return Promise.reject(error)
  }
)

export default apiClient
