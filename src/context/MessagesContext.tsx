// TODO: Messagerie - Contexte temporaire pour éviter les erreurs
// À remplacer par la vraie implémentation plus tard

import React, { createContext, useContext } from 'react';

interface MessagesContextType {
  unreadCount: number;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = {
    unreadCount: 0
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};