const API_BASE_URL = 'http://localhost:3000';

export interface PaymentData {
  amount: number;
  currency: string;
  metadata: {
    bookingId: string;
    adId: string;
  };
}

export interface PaymentResponse {
  checkout_url: string;
  payment_id: string;
  status: string;
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    const response = await fetch(`${API_BASE_URL}/moneroo/create-payment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du paiement');
    }

    return response.json();
  }

  async verifyPayment(paymentId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/moneroo/verify/${paymentId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la vérification du paiement');
    }

    return response.json();
  }
}

export const paymentService = new PaymentService();