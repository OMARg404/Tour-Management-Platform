// apiClient.js - Fixed Implementation
import axios from 'axios';

const createApiClient = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseURL = isProduction ? '/api/v1' : 'http://localhost:3000/api/v1';

    const instance = axios.create({
        baseURL,
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
    });

    const handleUnauthorized = (error) => {
        // const isUnauthorized = error.response ? .status === 401;

        // if (isUnauthorized) {
        //     console.warn('Authentication required - Redirecting to login');
        //     // Optional: Add redirect logic here
        //     // if (typeof window !== 'undefined') {
        //     //     window.location.replace('/auth/login');
        //     // }
        // }

        // return Promise.reject(error);
    };

    instance.interceptors.response.use(
        response => response,
        error => handleUnauthorized(error)
    );

    return instance;
};

const apiClient = createApiClient();
export default apiClient;