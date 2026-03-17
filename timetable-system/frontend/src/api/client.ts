// import axios from 'axios'

// const api = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
// })

// // Attach token to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('access_token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// // Handle 401 globally
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('access_token')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     }
//     return Promise.reject(err)
//   }
// )

// export default api


import axios from "axios";

// axios instance
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// 🔥 REQUEST INTERCEPTOR (har requestga token qo‘shadi)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔥 RESPONSE INTERCEPTOR (401 bo‘lsa logout qiladi)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // token eskirgan yoki yo‘q
      localStorage.removeItem("token");
      window.location.href = "/login"; // login page ga qaytaradi
    }

    return Promise.reject(error);
  }
);

export default api;