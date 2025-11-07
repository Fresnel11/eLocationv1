import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Image, X } from 'lucide-react';
import { messagesService } from '../services/messagesService';
import { Button } from '../components/ui/Button';
import { EmojiPicker } from '../components/ui/EmojiPicker';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { websocketService } from '../services/websocketService';

export interface Conversation {
  id: string;
  user1: {
    id: string;
    firstName: string;
    lastName: string;
  };
  user2: {
    id: string;
    firstName: string;
    lastName: string;
  };
  ad?: {
    id: string;
    title: string;
  };
  lastMessageContent: string;
  lastMessageAt: string;
  unreadCountUser1: number;
  unreadCountUser2: number;
}

export interface Message {
  id: string;
  content: string;
  isEncrypted: boolean;
  senderId: string;
  receiverId: string;
  adId?: string;
  createdAt: string;
  messageType?: string;
  imageUrl?: string;
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

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { refreshUnreadCount } = useMessages();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    fetchConversations();
  }, []);

  // Gérer l'ouverture automatique d'une conversation via l'URL
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    const adId = searchParams.get('adId');
    const userId = searchParams.get('userId');
    
    if (conversationId && conversations.length > 0) {
      // Trouver la conversation par ID
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        handleSelectConversation(conversation);
      }
    } else if (adId && userId && conversations.length > 0) {
      // Trouver la conversation par adId et userId
      const conversation = conversations.find(c => {
        const otherUser = getOtherUser(c);
        return c.ad?.id === adId && otherUser.id === userId;
      });
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [conversations, searchParams]);

  const fetchConversations = async () => {
    try {
      const data = await messagesService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.user1.id === user?.id ? conversation.user2 : conversation.user1;
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.user1.id === user?.id 
      ? conversation.unreadCountUser1 
      : conversation.unreadCountUser2;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (conversation: Conversation) => {
    try {
      setMessagesLoading(true);
      const otherUser = getOtherUser(conversation);
      console.log('Fetching messages for:', {
        adId: conversation.ad?.id || '',
        otherUserId: otherUser.id,
        conversationId: conversation.id
      });
      const data = await messagesService.getMessages(
        conversation.ad?.id || '',
        otherUser.id
      );
      console.log('Messages received:', data);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation);
    
    // Actualiser le compteur après avoir marqué les messages comme lus
    setTimeout(() => {
      refreshUnreadCount();
    }, 500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || sending || !selectedConversation) return;

    try {
      setSending(true);
      const otherUser = getOtherUser(selectedConversation);
      
      let imageUrl = null;
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);
        const uploadResponse = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.filePath;
      }
      
      await messagesService.sendMessage({
        content: newMessage.trim() || (selectedImage ? 'Image' : ''),
        receiverId: otherUser.id,
        adId: selectedConversation.ad?.id
      });
      
      // Le message sera ajouté via WebSocket
      
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      refreshUnreadCount();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket pour les messages en temps réel
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      // Ajouter le message à la liste si c'est pour la conversation actuelle
      if (selectedConversation && user) {
        const otherUser = getOtherUser(selectedConversation);
        const isForCurrentConversation = 
          (message.senderId === otherUser.id && message.receiverId === user.id) ||
          (message.senderId === user.id && message.receiverId === otherUser.id);
        
        if (isForCurrentConversation) {
          setMessages(prev => {
            // Éviter les doublons
            const exists = prev.some(m => m.id === message.id);
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
        }
      }
      // Actualiser la liste des conversations
      fetchConversations();
    };

    websocketService.on('new_message', handleNewMessage);

    return () => {
      websocketService.off('new_message', handleNewMessage);
    };
  }, [selectedConversation, user]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
      {/* Header Mobile */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        {selectedConversation ? (
          <>
            <button
              onClick={() => setSelectedConversation(null)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-semibold">
                {getOtherUser(selectedConversation).firstName[0]}
              </span>
            </div>
            <h1 className="text-lg font-semibold">
              {getOtherUser(selectedConversation).firstName} {getOtherUser(selectedConversation).lastName}
            </h1>
          </>
        ) : (
          <h1 className="text-lg font-semibold">Messages</h1>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} md:w-80 w-full flex-col bg-white border-r border-gray-200`}>
          <div className="hidden md:block p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  Aucune conversation
                </h3>
                <p className="text-sm text-gray-600">
                  Vos conversations apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  const unreadCount = getUnreadCount(conversation);
                  const isSelected = selectedConversation?.id === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-semibold">
                            {otherUser.firstName[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium text-gray-900 truncate text-sm">
                              {otherUser.firstName} {otherUser.lastName}
                            </h3>
                            {unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.ad && (
                            <p className="text-xs text-blue-600 mb-1 truncate">
                              {conversation.ad.title}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessageContent}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="hidden md:flex items-center p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-semibold">
                    {getOtherUser(selectedConversation).firstName[0]}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {getOtherUser(selectedConversation).firstName} {getOtherUser(selectedConversation).lastName}
                  </h2>
                  {selectedConversation.ad && (
                    <p className="text-sm text-blue-600">{selectedConversation.ad.title}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ height: 'calc(100% - 120px)' }}>
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun message pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md rounded-2xl ${
                            message.sender.id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          {message.messageType === 'image' && message.imageUrl ? (
                            <div className="p-2">
                              <img 
                                src={message.imageUrl.startsWith('http') ? message.imageUrl : `http://localhost:3000${message.imageUrl}`}
                                alt="Image envoyée"
                                className="max-w-full h-auto rounded-lg mb-2"
                              />
                              {message.content && message.content !== 'Image' && (
                                <p className="text-sm">{message.content}</p>
                              )}
                            </div>
                          ) : (
                            <div className="px-4 py-2">
                              <p className="text-sm">{message.content}</p>
                            </div>
                          )}
                          <p className={`text-xs px-4 pb-2 ${
                            message.sender.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img src={imagePreview} alt="Aperçu" className="max-w-32 h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <div className="flex gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <Image className="h-5 w-5" />
                    </button>
                    <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  </div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={(!newMessage.trim() && !selectedImage) || sending}
                    className="bg-blue-600 hover:bg-blue-700 rounded-full px-4 py-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-600">
                  Choisissez une conversation pour commencer à discuter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};