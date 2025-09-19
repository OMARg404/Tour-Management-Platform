// 📁 src/api/users.js
import apiClient from '../utils/apiClient';

// ✅ Get all users
export const getAllUsers = async() => {
    return apiClient.get('/users'); // GET http://127.0.0.1:3000/api/v1/users
};

// ✅ Add a new user
export const addUser = async(userData) => {
    return apiClient.post('/users', userData);

};

// ✅ Get a specific user by ID
export const getOneUser = async(userId) => {
    return apiClient.get(`/users/${userId}`); // eg. /users/1
};

// ✅ Delete a user by ID
export const deleteUser = async(userId) => {
    return apiClient.delete(`/users/${userId}`); // eg. /users/2
};