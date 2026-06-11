
import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "/api",
})

api.interceptors.request.use(async (config) => {
  try {
    if (window.Clerk?.session) {
      const token = await window.Clerk.session.getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch (error) {
    console.warn("Failed to get Clerk token:", error)
  }
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
