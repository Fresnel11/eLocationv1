import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconPlus from '~icons/line-md/plus';
import { useAuth } from '../../context/AuthContext';

interface CreateAdButtonProps {
  /** Conservé pour compatibilité : la publication se termine par une navigation. */
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Mène toujours vers la page dédiée /create-ad.
 *
 * Le composant ouvrait auparavant une fenêtre modale sur grand écran et
 * naviguait sur mobile : deux formulaires à maintenir en parallèle, et un
 * parcours de publication impossible à partager ou à reprendre par son URL.
 */
export const CreateAdButton: React.FC<CreateAdButtonProps> = ({ className = '', children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <button
      type="button"
      onClick={() => navigate(user ? '/create-ad' : '/login')}
      className={`inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-700 ${className}`}
    >
      {children ?? (
        <>
          <IconPlus />
          Publier une annonce
        </>
      )}
    </button>
  );
};
