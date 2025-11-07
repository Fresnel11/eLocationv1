import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Bot } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: string;
  message: string;
  isAgent: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface ChatWidgetProps {
  onClose: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    startChatSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startChatSession = async () => {
    try {
      // Message de bienvenue de l'IA
      setMessages([{
        id: 'welcome',
        message: 'Bonjour ! Je suis l\'assistant virtuel d\'eLocation Bénin. Je suis là pour vous aider avec toutes vos questions concernant notre plateforme de location. Comment puis-je vous assister ?',
        isAgent: true,
        createdAt: new Date().toISOString(),
        user: { firstName: 'Assistant IA', lastName: 'eLocation' }
      }]);
    } catch (error) {
      console.error('Erreur démarrage chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageText,
      isAgent: false,
      createdAt: new Date().toISOString(),
      user: { firstName: user?.firstName || 'Vous', lastName: user?.lastName || '' }
    };
    setMessages(prev => [...prev, userMessage]);

    // Ajouter le loader IA
    const loaderId = 'loading-' + Date.now();
    const loadingMessage: ChatMessage = {
      id: loaderId,
      message: 'typing',
      isAgent: true,
      createdAt: new Date().toISOString(),
      user: { firstName: 'Assistant IA', lastName: 'eLocation' }
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Prompt pour l'IA avec contexte eLocation
      const prompt = `Tu es l'assistant virtuel d'eLocation Bénin, une plateforme de location au Bénin. Tu dois répondre uniquement aux questions concernant :
- La plateforme eLocation (inscription, connexion, navigation)
- La publication d'annonces de location
- La recherche et réservation de biens
- Les catégories disponibles (immobilier, véhicules, électroménager, événementiel, professionnel, loisirs)
- Les fonctionnalités (favoris, messages, notifications, etc.)
- Les problèmes techniques sur la plateforme
- Les politiques et conditions d'utilisation

Si la question n'est pas liée à eLocation, réponds poliment que tu es l'assistant virtuel d'eLocation et que tu ne peux répondre qu'aux questions concernant la plateforme.

Si tu ne peux pas répondre à une question spécifique sur eLocation, demande à l'utilisateur de contacter le service client à elocationcontact@gmail.com ou +229 0199154678.

Question de l'utilisateur : ${messageText}

Réponds de manière concise et utile :`;

      const response = await (window as any).puter.ai.chat(prompt, {
        model: "gpt-4o",
        maxTokens: 300
      });

      const aiText = response?.result?.message?.content || response?.message?.content || response?.content || 'Désolé, je rencontre un problème technique. Veuillez contacter notre service client à elocationcontact@gmail.com';

      // Remplacer le loader par la réponse
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: aiText.trim(),
        isAgent: true,
        createdAt: new Date().toISOString(),
        user: { firstName: 'Assistant IA', lastName: 'eLocation' }
      };
      setMessages(prev => prev.filter(msg => msg.id !== loaderId).concat(botResponse));
    } catch (error) {
      console.error('Erreur IA:', error);
      // Remplacer le loader par le message d'erreur
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Désolé, je rencontre un problème technique. Veuillez contacter notre service client à elocationcontact@gmail.com ou +229 0199154678.',
        isAgent: true,
        createdAt: new Date().toISOString(),
        user: { firstName: 'Assistant IA', lastName: 'eLocation' }
      };
      setMessages(prev => prev.filter(msg => msg.id !== loaderId).concat(errorResponse));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-medium">Assistant IA eLocation</h3>
            <p className="text-xs opacity-90">En ligne</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-blue-700 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isAgent ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] ${message.isAgent ? 'order-2' : 'order-1'}`}>
              <div
                className={`p-3 rounded-lg ${
                  message.isAgent
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.message === 'typing' ? (
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 px-1">
                {message.isAgent ? 'Assistant IA' : 'Vous'} • {new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className={`${message.isAgent ? 'order-1 mr-2' : 'order-2 ml-2'} relative`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.isAgent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {message.isAgent ? (
                  <Bot className="h-4 w-4 text-blue-600" />
                ) : (
                  <User className="h-4 w-4 text-gray-600" />
                )}
              </div>
              {message.isAgent && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};