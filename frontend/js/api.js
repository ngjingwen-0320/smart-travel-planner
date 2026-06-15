// const API_URL = 'http://localhost:5001/api/v1'; // Added /v1 to match app.js

const API_URL = 'https://smart-travel-planner-4jnh.onrender.com/api/v1';

async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json'
    };

    // If we have a token saved from login, add it to the headers
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // 1. Check if the response is empty (Status 204)
        if (response.status === 204) {
            return null; // Return early, don't try to parse JSON
        }

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('Frontend API Error:', error.message);
        throw error;
    }
}