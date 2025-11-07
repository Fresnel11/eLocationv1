import { api } from './api';

export const supportService = {
  // Tickets
  async createTicket(subject: string, description: string, priority = 'medium') {
    const response = await api.post('/support/tickets', { subject, description, priority });
    return response.data;
  },

  async getTickets() {
    const response = await api.get('/support/tickets');
    return response.data;
  },

  async getTicket(ticketId: string) {
    const response = await api.get(`/support/tickets/${ticketId}`);
    return response.data;
  },

  async addTicketMessage(ticketId: string, message: string) {
    const response = await api.post(`/support/tickets/${ticketId}/messages`, { message });
    return response.data;
  },

  // FAQ
  async getFAQs(category?: string) {
    const response = await api.get(`/support/faq${category ? `?category=${category}` : ''}`);
    return response.data;
  },

  async getFAQCategories() {
    const response = await api.get('/support/faq/categories');
    return response.data;
  },

  // Base de connaissances
  async getKnowledgeBase(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await api.get(`/support/knowledge-base?${params}`);
    return response.data;
  },

  async getArticle(articleId: string) {
    const response = await api.get(`/support/knowledge-base/${articleId}`);
    return response.data;
  },

  async rateArticle(articleId: string, helpful: boolean) {
    const response = await api.post(`/support/knowledge-base/${articleId}/rate`, { helpful });
    return response.data;
  },

  // Chat
  async startChat() {
    const response = await api.post('/support/chat/start');
    return response.data;
  },

  async getChatSession(sessionId: string) {
    const response = await api.get(`/support/chat/${sessionId}`);
    return response.data;
  },

  async sendChatMessage(sessionId: string, message: string) {
    const response = await api.post(`/support/chat/${sessionId}/message`, { message });
    return response.data;
  },

  // Recherche
  async searchSupport(query: string) {
    const response = await api.get(`/support/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};