class ApiService {
  static API_BASE_URL = 'https://superankireddy-production.up.railway.app/api';

  static async request(endpoint, options = {}) {
    const url = `${this.API_BASE_URL}${endpoint}`;
    console.log('🔗 Making API request to:', url);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (config.body) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      console.log('✅ API Response:', data);
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  }

  // Auth APIs
  static async signup(userData) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  }

  static async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  static async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  static async getReferralStats(userId) {
    return this.request(`/users/${userId}/referral-stats`);
  }

  // New: Fetch full tree structure
  static async getTree() {
    return this.request('/tree');
  }

  static async testConnection() {
    return this.request('/test-db');
  }
}

export default ApiService;