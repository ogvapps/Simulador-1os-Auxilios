import React, { useCallback, memo } from 'react';
import { HeartPulse, Volume2 } from 'lucide-react';

export const Header = memo(function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-white bg-red-600 p-2 rounded-full">
            <HeartPulse size={24} />
          </span>
          <h1 className="text-xl md:text-3xl font-bold text-red-700">
            Simulador de Primeros Auxilios
          </h1>
        </div>
      </div>
    </header>
  );
});

export const SpeakButton = memo(function SpeakButton({ text, lang = 'es-ES' }: { text: string; lang?: string }) {
  const handleSpeak = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!text || typeof window.speechSynthesis === 'undefined') {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    },
    [text, lang]
  );

  return (
    <button
      onClick={handleSpeak}
      title="Leer en voz alta"
      className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100 ml-2"
    >
      <Volume2 size={20} />
    </button>
  );
});