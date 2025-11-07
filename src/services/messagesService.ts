import { api } from './api';
import { encryptionService } from './encryptionService';

export interface Message {
  id: string;
  content: string;
  isEncrypted: boolean;
  senderId: string;
  receiverId: string;
  adId?: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export const messagesService = {
  async sendMessage(data: {
    content: string;
    receiverId: string;
    adId?: string;
    encrypt?: boolean;
  }): Promise<Message> {
    let messageContent = data.content;
    let isEncrypted = false;

    if (data.encrypt) {
      try {
        // Récupérer la clé publique du destinataire
        const { data: keyData } = await api.get(`/users/${data.receiverId}/public-key`);
        if (keyData.publicKey) {
          messageContent = await encryptionService.encryptMessage(data.content, keyData.publicKey);
          isEncrypted = true;
        }
      } catch (error) {
        console.warn('Impossible de chiffrer le message, envoi en clair:', error);
      }
    }

    const response = await api.post('/messages', {
      content: messageContent,
      receiverId: data.receiverId,
      adId: data.adId,
      isEncrypted
    });

    return response.data;
  },

  async getMessages(adId: string | null, otherUserId: string): Promise<Message[]> {
    const endpoint = adId 
      ? `/messages/conversation/${adId}/${otherUserId}`
      : `/messages/conversation/direct/${otherUserId}`;
    
    const response = await api.get(endpoint);
    const messages = response.data;

    // Déchiffrer les messages chiffrés
    for (const message of messages) {
      if (message.isEncrypted) {
        try {
          message.content = await encryptionService.decryptMessage(message.content);
        } catch (error) {
          console.error('Erreur de déchiffrement:', error);
          message.content = '[Message chiffré - impossible à déchiffrer]';
        }
      }
    }

    return messages;
  },

  async getConversations() {
    const response = await api.get('/messages/conversations');
    return response.data;
  },

  async markAsRead(adId: string | null, otherUserId: string) {
    const endpoint = adId 
      ? `/messages/mark-read/${adId}/${otherUserId}`
      : `/messages/mark-read/direct/${otherUserId}`;
    
    return api.post(endpoint);
  },

  async getUnreadCount() {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },

  // Initialiser les clés de chiffrement
  async initializeEncryption() {
    try {
      // Essayer de charger les clés existantes
      const keysLoaded = await encryptionService.loadKeysFromStorage();
      
      if (!keysLoaded) {
        // Générer de nouvelles clés
        await encryptionService.generateKeyPair();
        await encryptionService.saveKeysToStorage();
      }

      // Envoyer la clé publique au serveur
      const publicKey = await encryptionService.exportPublicKey();
      await api.patch('/users/public-key', { publicKey });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du chiffrement:', error);
      return false;
    }
  },

  async createOrGetConversation(receiverId: string, adId?: string) {
    const response = await api.post('/messages/conversation', {
      receiverId,
      adId
    });
    return response.data;
  }
};