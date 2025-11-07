import { api } from './api';

export interface Booking {
  id: string;
  ad: {
    id: string;
    title: string;
    price: string;
    photos: string[];
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
  };
  owner: {
    id: string;
    firstName: string;
    lastName: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  deposit: number;
  status: 'pending' | 'accepted' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  message?: string;
  cancellationReason?: string;
  createdAt: string;
}

export interface CreateBookingData {
  adId: string;
  startDate: string;
  endDate: string;
  message?: string;
  deposit?: number;
}

export interface AvailabilityResponse {
  isAvailable: boolean;
  conflictingBookings: Booking[];
}

export const bookingsService = {
  async createBooking(data: CreateBookingData): Promise<Booking> {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  async getMyBookings(page = 1, limit = 10) {
    const response = await api.get(`/bookings/my-bookings?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getReceivedBookings(page = 1, limit = 10) {
    const response = await api.get(`/bookings/received-bookings?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async updateBooking(id: string, data: { status?: string; cancellationReason?: string }): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}`, data);
    return response.data;
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}`, {
      status: 'cancelled',
      cancellationReason: reason
    });
    return response.data;
  },

  async acceptBooking(id: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/accept`);
    return response.data;
  },

  async checkAvailability(adId: string, startDate?: string, endDate?: string): Promise<AvailabilityResponse> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/bookings/ad/${adId}/availability?${params.toString()}`);
    return response.data;
  },
};