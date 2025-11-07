import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Clock, AlertTriangle, Send, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _messageCount: number;
}

interface TicketMessage {
  id: string;
  content: string;
  isFromAdmin: boolean;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

interface TicketDetails extends SupportTicket {
  messages: TicketMessage[];
}

const statusLabels = {
  open: 'Ouvert',
  in_progress: 'En cours',
  resolved: 'Résolu',
  closed: 'Fermé'
};

const priorityLabels = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
  urgent: 'Urgente'
};

export const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const { success, error } = useToast();

  useEffect(() => {
    fetchTickets();
  }, [filters, pagination.page]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority })
      });

      const response = await api.get(`/admin/support/tickets?${params}`);
      setTickets(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (err) {
      error('Erreur', 'Impossible de charger les tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId: string) => {
    try {
      const response = await api.get(`/admin/support/tickets/${ticketId}`);
      setSelectedTicket(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les détails du ticket');
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      await api.post(`/admin/support/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage
      });
      setReplyMessage('');
      await fetchTicketDetails(selectedTicket.id);
      success('Réponse envoyée', 'Votre réponse a été envoyée avec succès');
    } catch (err) {
      error('Erreur', 'Impossible d\'envoyer la réponse');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await api.put(`/admin/support/tickets/${ticketId}/status`, {
        status: newStatus
      });
      await fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        await fetchTicketDetails(ticketId);
      }
      success('Statut mis à jour', 'Le statut du ticket a été mis à jour');
    } catch (err) {
      error('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Liste des tickets */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Support Client</h1>
          </div>
          
          <div className="space-y-3">
            <Select
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              options={[
                { value: '', label: 'Tous les statuts' },
                { value: 'open', label: 'Ouvert' },
                { value: 'in_progress', label: 'En cours' },
                { value: 'resolved', label: 'Résolu' },
                { value: 'closed', label: 'Fermé' }
              ]}
            />
            <Select
              value={filters.priority}
              onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              options={[
                { value: '', label: 'Toutes les priorités' },
                { value: 'urgent', label: 'Urgente' },
                { value: 'high', label: 'Élevée' },
                { value: 'medium', label: 'Moyenne' },
                { value: 'low', label: 'Faible' }
              ]}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => fetchTicketDetails(ticket.id)}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate">{ticket.subject}</h3>
                <div className="flex items-center gap-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {priorityLabels[ticket.priority]}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ticket.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {ticket.user.firstName} {ticket.user.lastName}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                    {statusLabels[ticket.status]}
                  </span>
                  <span>{ticket._messageCount} msg</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Détails du ticket */}
      <div className="flex-1 flex flex-col">
        {selectedTicket ? (
          <>
            {/* En-tête */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h2>
                  <p className="text-sm text-gray-600">
                    Par {selectedTicket.user.firstName} {selectedTicket.user.lastName} • 
                    {new Date(selectedTicket.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTicket.status}
                    onChange={(value) => handleStatusChange(selectedTicket.id, value)}
                    options={[
                      { value: 'open', label: 'Ouvert' },
                      { value: 'in_progress', label: 'En cours' },
                      { value: 'resolved', label: 'Résolu' },
                      { value: 'closed', label: 'Fermé' }
                    ]}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedTicket.status)}`}>
                  {statusLabels[selectedTicket.status]}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                  {priorityLabels[selectedTicket.priority]}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Message initial */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {selectedTicket.user.firstName} {selectedTicket.user.lastName}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedTicket.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-gray-900">{selectedTicket.description}</p>
              </div>

              {/* Messages de conversation */}
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-4 ${
                    message.isFromAdmin 
                      ? 'bg-blue-50 ml-8' 
                      : 'bg-gray-50 mr-8'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.isFromAdmin ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      <span className="text-white text-xs font-medium">
                        {message.author.firstName.charAt(0)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {message.author.firstName} {message.author.lastName}
                    </span>
                    {message.isFromAdmin && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Admin
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-900">{message.content}</p>
                </div>
              ))}
            </div>

            {/* Zone de réponse */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-3">
                <Input
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Tapez votre réponse..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                />
                <Button
                  onClick={handleReply}
                  disabled={!replyMessage.trim() || sendingReply}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendingReply ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un ticket</h3>
              <p className="text-gray-500">Choisissez un ticket dans la liste pour voir les détails</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};