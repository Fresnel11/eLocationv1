import React, { useState } from 'react';
import { X, Send, Minimize2, Maximize2, Paperclip } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface EmailReplyModalProps {
  contact: Contact;
  onClose: () => void;
  onSent: () => void;
}

export const EmailReplyModal: React.FC<EmailReplyModalProps> = ({ contact, onClose, onSent }) => {
  const [subject, setSubject] = useState(`Re: ${contact.subject}`);
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { success, error } = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      error('Erreur', 'Le message ne peut pas être vide');
      return;
    }

    setIsSending(true);
    try {
      await api.post(`/contact/${contact.id}/reply`, {
        subject,
        message
      });
      success('Email envoyé', 'Votre réponse a été envoyée avec succès');
      onSent();
      onClose();
    } catch (err) {
      error('Erreur', 'Impossible d\'envoyer l\'email');
    } finally {
      setIsSending(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 z-50">
        <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg cursor-pointer hover:bg-gray-700 transition-colors"
             onClick={() => setIsMinimized(false)}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate max-w-48">
              Réponse à {contact.name}
            </span>
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="ml-2 hover:bg-gray-600 rounded p-1">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-6 z-50 w-96 bg-white rounded-t-lg shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-lg border-b">
        <h3 className="font-medium text-gray-900">Nouveau message</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Minimize2 className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-3">
        {/* To */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 w-8">À:</label>
          <div className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm">
            {contact.name} &lt;{contact.email}&gt;
          </div>
        </div>

        {/* From */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 w-8">De:</label>
          <div className="flex-1 bg-gray-50 px-3 py-2 rounded text-sm">
            eLocation Support &lt;elocationcontact@gmail.com&gt;
          </div>
        </div>

        {/* Subject */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600 w-8">Objet:</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 h-9"
            placeholder="Objet du message"
          />
        </div>
      </div>

      {/* Message */}
      <div className="px-4 pb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tapez votre message ici..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Original Message */}
      <div className="px-4 pb-4">
        <div className="border-t pt-3">
          <p className="text-xs text-gray-500 mb-2">Message original:</p>
          <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-20 overflow-y-auto">
            <p className="font-medium mb-1">{contact.subject}</p>
            <p className="text-xs text-gray-500 mb-2">De: {contact.name} &lt;{contact.email}&gt;</p>
            <p className="whitespace-pre-wrap">{contact.message}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-b-lg border-t">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleSend}
            disabled={isSending}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{isSending ? 'Envoi...' : 'Envoyer'}</span>
          </Button>
          <button className="p-2 hover:bg-gray-200 rounded">
            <Paperclip className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="text-xs text-gray-500">
          Ctrl+Entrée pour envoyer
        </div>
      </div>
    </div>
  );
};