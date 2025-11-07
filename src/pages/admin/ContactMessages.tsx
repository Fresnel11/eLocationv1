import React, { useState, useEffect } from 'react';
import { Mail, Eye, ArrowLeft, Search, MoreVertical, Archive, Trash2, Reply, Forward, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { EmailReplyModal } from '../../components/admin/EmailReplyModal';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const ContactMessages: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Contact | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await api.get('/contact');
      setContacts(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/contact/${id}/read`);
      setContacts(prev => prev.map(contact => 
        contact.id === id ? { ...contact, isRead: true } : contact
      ));
    } catch (err) {
      error('Erreur', 'Impossible de marquer le message comme lu');
    }
  };

  const handleSelectMessage = (contact: Contact) => {
    setSelectedContact(contact);
    setShowMobileDetail(true);
    if (!contact.isRead) {
      markAsRead(contact.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = contacts.filter(c => !c.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="border-b bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages de Contact</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 h-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Liste des messages */}
        <div className={`${showMobileDetail ? 'hidden' : 'block'} lg:block w-full lg:w-96 border-r bg-gray-50 overflow-y-auto`}>
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun résultat' : 'Aucun message'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Aucun message ne correspond à votre recherche.' : 'Aucun message de contact reçu.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-4 cursor-pointer hover:bg-white transition-colors ${
                    selectedContact?.id === contact.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  } ${!contact.isRead ? 'bg-white' : ''}`}
                  onClick={() => handleSelectMessage(contact)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        !contact.isRead ? 'bg-blue-600' : 'bg-gray-400'
                      }`}>
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm truncate ${
                            !contact.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                          }`}>
                            {contact.name}
                          </p>
                          {!contact.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatDate(contact.createdAt)}
                    </span>
                  </div>
                  <div className="ml-13">
                    <p className={`text-sm mb-1 truncate ${
                      !contact.isRead ? 'font-medium text-gray-900' : 'text-gray-700'
                    }`}>
                      {contact.subject}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {contact.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détail du message */}
        <div className={`${showMobileDetail ? 'block' : 'hidden'} lg:block flex-1 bg-white flex flex-col`}>
          {selectedContact ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header du message */}
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileDetail(false)}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedContact.subject}
                </h2>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedContact.name}</p>
                      <p className="text-sm text-gray-600">{selectedContact.email}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatFullDate(selectedContact.createdAt)}
                  </p>
                </div>
              </div>
              
              {/* Contenu du message */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="prose max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="border-t px-6 py-4 bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Button 
                    size="sm" 
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setReplyingTo(selectedContact)}
                  >
                    <Reply className="h-4 w-4" />
                    <span>Répondre</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Forward className="h-4 w-4" />
                    <span>Transférer</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez un message
                </h3>
                <p className="text-gray-600">
                  Choisissez un message dans la liste pour le lire
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de réponse */}
      {replyingTo && (
        <EmailReplyModal
          contact={replyingTo}
          onClose={() => setReplyingTo(null)}
          onSent={() => {
            fetchContacts();
            setReplyingTo(null);
          }}
        />
      )}
    </div>
  );
};