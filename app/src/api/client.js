import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    r => r,
    e => {
        if (e.response && e.response.headers['content-type'] && e.response.headers['content-type'].includes('application/problem+json')){
            const problem = e.response.data
            const err = new Error(problem.title || 'Server error')
            err.problem = problem
            err.status = problem.status || e.response.status
            return Promise.reject(err)
        }
        return Promise.reject(e)
    }
)

export default api