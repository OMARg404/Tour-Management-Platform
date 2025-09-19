// 📁 src/api/tours.js
import apiClient from '../utils/apiClient';

//////////////////////////
// 🧭 Basic CRUD Tours APIs
//////////////////////////

// ✅ Get all tours (with optional filters as query params)
export const getAllTours = async(params = {}) => {
    return apiClient.get('/tours/all', { params });
};

// ✅ Get one specific tour by ID
export const getOneTour = async(tourId) => {
    return apiClient.get(`/tours/${tourId}`);
};

// ✅ Add a new tour
export const addTour = async(tourData) => {
    return apiClient.post('/tours', tourData);
};

// ✅ Update a tour by ID (PATCH)
export const updateTour = async(tourId, updateData) => {
    return apiClient.patch(`/tours/${tourId}`, updateData);
};

// ✅ Delete a tour by ID
export const deleteTour = async(tourId) => {
    return apiClient.delete(`/tours/${tourId}`);
};

//////////////////////////
// 📊 Analytics / Reports
//////////////////////////

// ✅ Get top 5 cheap tours
export const getTop5Cheap = async() => {
    return apiClient.get('/tours/top-5-cheap');
};

// ✅ Get general tour statistics
export const getTourStats = async() => {
    return apiClient.get('/tours/tour-stats');
};

// ✅ Get statistics grouped by country
export const getStatsByCountry = async() => {
    return apiClient.get('/tours/stats-by-country');
};

// ✅ Get top revenue per visitor tours
export const getTopRevenuePerVisitor = async() => {
    return apiClient.get('/tours/top-revenue-per-visitor');
};