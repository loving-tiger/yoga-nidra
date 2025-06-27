import React, { createContext, useContext, useState } from 'react';

interface VoiceContextProps {
  voice: string;
  setVoice: (voice: string) => void;
}

const VoiceContext = createContext<VoiceContextProps | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voice, setVoice] = useState('ElevenLabsMatt.mp3');
  return (
    <VoiceContext.Provider value={{ voice, setVoice }}>
      {children}
    </VoiceContext.Provider>
  );
};

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error('useVoice must be used within a VoiceProvider');
  return ctx;
} 