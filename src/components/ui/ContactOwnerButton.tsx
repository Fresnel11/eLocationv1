import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './Button';
import { MessageModal } from './MessageModal';

interface ContactOwnerButtonProps {
  adId: string;
  adTitle: string;
  ownerId: string;
  ownerName: string;
  className?: string;
}

export const ContactOwnerButton: React.FC<ContactOwnerButtonProps> = ({
  adId,
  adTitle,
  ownerId,
  ownerName,
  className = ''
}) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsMessageModalOpen(true)}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Contacter
      </Button>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        adId={adId}
        adTitle={adTitle}
        otherUserId={ownerId}
        otherUserName={ownerName}
      />
    </>
  );
};