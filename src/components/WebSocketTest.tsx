import React from 'react';
import { useNotifications } from '../context/NotificationContext';

export const WebSocketTest: React.FC = () => {
  const { socket } = useNotifications();

  const testWebSocket = () => {
    if (socket) {
      console.log('Envoi test WebSocket...');
      socket.emit('test_notification', { message: 'Test depuis le frontend' });
      
      socket.once('test_response', (response) => {
        console.log('Réponse du serveur:', response);
        alert(`WebSocket Test: ${response.message}`);
      });
    } else {
      alert('WebSocket non connecté');
    }
  };

  return (
    <button
      onClick={testWebSocket}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      Test WebSocket
    </button>
  );
};