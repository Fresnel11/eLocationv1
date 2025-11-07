import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import { CreateAdModal } from './CreateAdModal';
import { useAuth } from '../../context/AuthContext';

interface CreateAdButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const CreateAdButton: React.FC<CreateAdButtonProps> = ({ 
  onSuccess, 
  className = '',
  children 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (isMobile) {
      navigate('/create-ad');
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
      >
        {children || (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Publier une annonce
          </>
        )}
      </Button>

      <CreateAdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};