// API Base URL - Environment variable'dan oku, yoksa localhost kullan
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : `${window.location.protocol}//${window.location.hostname}/api`;

// API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  // Request helper
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add token if available
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Update token
  updateToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Authentication API
  async register(name, email, password) {
    return await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success && response.data.token) {
      this.updateToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  // Flights API
  async searchFlights(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/flights?${queryString}`);
  }

  async getFlight(id) {
    return await this.request(`/flights/${id}`);
  }

  async getPopularRoutes() {
    return await this.request('/flights/popular/routes');
  }

  async getSearchSuggestions(query) {
    return await this.request(`/flights/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Favorites API
  async getFavorites() {
    return await this.request('/favorites');
  }

  async addToFavorites(flightId) {
    return await this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ flightId })
    });
  }

  async removeFromFavorites(favoriteId) {
    return await this.request(`/favorites/${favoriteId}`, {
      method: 'DELETE'
    });
  }

  async checkFavorite(flightId) {
    return await this.request(`/favorites/check/${flightId}`);
  }

  // Bookings API
  async createBooking(bookingData) {
    return await this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  async getBookings() {
    return await this.request('/bookings');
  }

  async getBooking(id) {
    return await this.request(`/bookings/${id}`);
  }

  async cancelBooking(id) {
    return await this.request(`/bookings/${id}/cancel`, {
      method: 'PUT'
    });
  }

  async updatePaymentStatus(id, paymentStatus) {
    return await this.request(`/bookings/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus })
    });
  }

  async downloadTicket(id) {
    return await this.request(`/bookings/${id}/download`);
  }

  async listTicketForSale(id, salePrice) {
    return await this.request(`/bookings/${id}/list-for-sale`, {
      method: 'PUT',
      body: JSON.stringify({ salePrice })
    });
  }

  async getListedTickets(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/bookings/listed-for-sale?${queryString}`);
  }

  // Users API
  async updateProfile(userData) {
    return await this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async changePassword(currentPassword, newPassword) {
    return await this.request('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async addPassenger(passengerData) {
    return await this.request('/users/passengers', {
      method: 'POST',
      body: JSON.stringify(passengerData)
    });
  }

  async updatePassenger(id, passengerData) {
    return await this.request(`/users/passengers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(passengerData)
    });
  }

  async deletePassenger(id) {
    return await this.request(`/users/passengers/${id}`, {
      method: 'DELETE'
    });
  }

  // Notifications API
  async getNotifications() {
    return await this.request('/notifications');
  }

  async markAsRead(id) {
    return await this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async updateNotificationSettings(settings) {
    return await this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Payments API
  async processPayment(bookingId, paymentMethod, cardDetails) {
    return await this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify({ bookingId, paymentMethod, cardDetails })
    });
  }

  async requestRefund(bookingId, reason) {
    return await this.request('/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ bookingId, reason })
    });
  }

  // Destinations API
  async getDestinations() {
    return await this.request('/destinations');
  }

  // Airlines API
  async getAirlines() {
    return await this.request('/airlines');
  }

  // Home API
  async getHomeData() {
    return await this.request('/home');
  }
}

// Global API instance
const api = new ApiService();

// Export for use in other files
window.api = api; 