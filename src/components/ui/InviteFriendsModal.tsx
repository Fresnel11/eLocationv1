import React, { useState } from 'react';
import { X, Users, Share2, Copy, Mail, MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { useToast } from '../../context/ToastContext';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  isOpen,
  onClose,
  referralCode
}) => {
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { success } = useToast();

  const inviteUrl = `${window.location.origin}/register${referralCode ? `?ref=${referralCode}` : ''}`;
  const defaultMessage = `Salut ! Je t'invite à rejoindre eLocation, la meilleure plateforme de location au Bénin. ${referralCode ? `Utilise mon code de parrainage ${referralCode} pour bénéficier d'avantages !` : ''} Inscris-toi ici : ${inviteUrl}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    success('Lien copié !', 'Le lien d\'invitation a été copié');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(message || defaultMessage);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(message || defaultMessage);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${text}`, '_blank');
  };

  const sendEmailInvites = async () => {
    if (!emails.trim()) return;
    
    setSending(true);
    try {
      // Simuler l'envoi d'emails (à implémenter côté backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      success('Invitations envoyées !', 'Vos amis vont recevoir les invitations par email');
      setEmails('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Erreur envoi invitations:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Inviter des amis</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Lien d'invitation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien d'invitation
            </label>
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={copyInviteLink}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Partage rapide */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Partage rapide
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareViaWhatsApp}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4 text-green-600" />
                WhatsApp
              </Button>
              <Button
                onClick={shareViaTelegram}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4 text-blue-600" />
                Telegram
              </Button>
            </div>
          </div>

          {/* Invitation par email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inviter par email
            </label>
            <Input
              placeholder="email1@example.com, email2@example.com..."
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              className="mb-3"
            />
            <textarea
              placeholder="Message personnalisé (optionnel)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Laissez vide pour utiliser le message par défaut
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={sendEmailInvites}
              loading={sending}
              disabled={!emails.trim()}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};