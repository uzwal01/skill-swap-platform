import axios from "axios";

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true,
});

// Request interceptors to attach token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response intercepters to handle 401 error automatically
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // token expired or invalid
            localStorage.removeItem('token');
            
            // Redirect to login page
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
)

export default api;