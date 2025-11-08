import { MessageStore } from '@/store/notification/Message'
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'
// import Constants from 'expo-constants'

// const extra = Constants.expoConfig?.extra || {}
// const baseURL = extra.API_BASE_URL
const baseURL = 'http://192.168.1.44:8080/api/v1'

const api = axios.create({
  baseURL,
})

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('token')

    if (token && config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`)
    }

    if (
      config.data instanceof FormData &&
      config.headers &&
      typeof config.headers.set === 'function' &&
      !config.headers.has('Content-Type')
    ) {
      config.headers.set('Content-Type', 'multipart/form-data')
    }

    return config
  },
  (error) => {
    MessageStore.getState().setMessage('Request setup failed', false)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.log('[Axios Error Response]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      })
    } else if (error.request) {
      console.log('[Axios No Response]', error.request)
    } else {
      console.log('[Axios General Error]', error.message)
    }

    return Promise.reject(error)
  }
)

type RequestOptions = {
  showMessage?: boolean
} & Parameters<typeof api.request>[0]

export const customRequest = async (
  config: RequestOptions,
  showMessage = false
) => {
  try {
    const response = await api.request(config)

    if (showMessage && response.data?.message) {
      MessageStore.getState().setMessage(response.data.message, true)
    }

    return response
  } catch (error: any) {
    if (error.response) {
      console.log('[CustomRequest Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        all: error,
      })
    } else if (error.request) {
      console.log('[CustomRequest No Response]', error.request)
    } else {
      console.log('[CustomRequest General Error]', error.message)
    }

    const message =
      error.response?.data?.message || error.message || 'Something went wrong'

    if (showMessage) {
      MessageStore.getState().setMessage(message, false)
    }

    throw error
  }
}

export default api
