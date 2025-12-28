// API base URL - use environment variable
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'token': token || ''
    };
};

// Helper function for authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
};

// Specific API functions
export const loginUser = async (email, password) => {
    return apiCall('/api/user/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
};

export const signupUser = async (fullName, email, password, bio) => {
    return apiCall('/api/user/signup', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, bio })
    });
};

export const updateProfile = async (profileData) => {
    return apiCall('/api/user/update-profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
    });
};

export const checkAuth = async () => {
    return apiCall('/api/user/check', {
        method: 'GET'
    });
};

export const logoutUser = async () => {
    return apiCall('/api/user/logout', {
        method: 'POST'
    });
};

export const deleteAccount = async () => {
    return apiCall('/api/user/delete-account', {
        method: 'DELETE'
    });
};

export const updateAvatar = async (avatar) => {
    return apiCall('/api/user/avatar', {
        method: 'PUT',
        body: JSON.stringify({ avatar })
    });
};

// Message API functions
export const getConversations = async () => {
    return apiCall('/api/messages/conversations', {
        method: 'GET'
    });
};

export const searchUsers = async (query) => {
    return apiCall(`/api/messages/search?q=${encodeURIComponent(query)}`, {
        method: 'GET'
    });
};

export const getMessages = async (userId) => {
    return apiCall(`/api/messages/${userId}`, {
        method: 'GET'
    });
};

export const sendMessage = async (userId, text, image) => {
    return apiCall(`/api/messages/send/${userId}`, {
        method: 'POST',
        body: JSON.stringify({ text, image })
    });
};

export const editMessage = async (messageId, text) => {
    return apiCall(`/api/messages/edit/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ text })
    });
};

export const deleteMessage = async (messageId) => {
    return apiCall(`/api/messages/delete/${messageId}`, {
        method: 'DELETE'
    });
};

export function formatMessageTime(date) {
    const messageDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

    const timeString = messageDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    if (messageDay.getTime() === today.getTime()) {
        return timeString;
    } else if (messageDay.getTime() === yesterday.getTime()) {
        return `Yesterday ${timeString}`;
    } else {
        return messageDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: messageDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        }) + ' ' + timeString;
    }
}