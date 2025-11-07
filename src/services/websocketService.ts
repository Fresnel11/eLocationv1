class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private messageCallbacks = new Map<string, Function[]>();
  private isConnecting = false;

  connect() {
    // Vérifier tous les états possibles
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    if (this.ws?.readyState === WebSocket.CONNECTING || this.isConnecting) {
      console.log('WebSocket connection already in progress');
      return;
    }
    
    // Fermer l'ancienne connexion si elle existe
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found for WebSocket connection');
      return;
    }

    this.isConnecting = true;
    
    try {
      this.ws = new WebSocket(`ws://localhost:3001`);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      return;
    }
    
    // Send auth message after connection
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Extract userId from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.send('auth', { userId: payload.sub });
      } catch (error) {
        console.error('Error parsing token:', error);
      }
      
      this.emit('connect');
    };



    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      this.isConnecting = false;
      this.emit('disconnect');
      
      // Only reconnect if it wasn't a manual disconnect
      if (event.code !== 1000) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnecting = false;
      this.emit('error', error);
    };
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.isConnecting = false;
    this.messageCallbacks.clear();
  }

  send(type: string, data?: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      if (type === 'auth') {
        this.ws.send(JSON.stringify({ type, ...data }));
      } else {
        this.ws.send(JSON.stringify({ type, data }));
      }
    } else {
      console.warn('WebSocket not connected');
    }
  }

  on(event: string, callback: Function) {
    if (!this.messageCallbacks.has(event)) {
      this.messageCallbacks.set(event, []);
    }
    this.messageCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.messageCallbacks.delete(event);
      return;
    }
    
    const callbacks = this.messageCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.messageCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    // Empêcher les reconnexions multiples
    if (this.isConnecting) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.max(2000, this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1));
    
    setTimeout(() => {
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();