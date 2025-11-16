import React, { useState, useRef, useCallback, useEffect, memo, useMemo } from 'react';
import { HeartPulse } from 'lucide-react';

export const RcpRhythmGame = memo(function RcpRhythmGame({ onGameComplete }: { onGameComplete: () => void }) {
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [count, setCount] = useState(0);
  const [result, setResult] = useState({ cpm: 0, success: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(0);

  const handleStart = useCallback(() => {
    setStatus('running');
    setCount(0);
    countRef.current = 0;
    setResult({ cpm: 0, success: false });

    timerRef.current = setTimeout(() => {
      setStatus('finished');
      const finalCount = countRef.current;
      const cpm = finalCount * 6;
      const success = cpm >= 100 && cpm <= 120;
      setResult({ cpm, success });
      if (success) {
        onGameComplete();
      }
    }, 10000);
  }, [onGameComplete]);

  const handleClick = useCallback(() => {
    if (status === 'running') {
      countRef.current += 1;
      setCount(countRef.current);
    }
  }, [status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full text-center p-4 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
      {status === 'idle' && (
        <>
          <p className="text-lg font-semibold text-red-700 mb-4">¡Practica el ritmo! (100-120 cpm)</p>
          <button onClick={handleStart} className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700">
            Comenzar (10 seg)
          </button>
        </>
      )}
      {status === 'running' && (
        <button onClick={handleClick} className="w-40 h-40 bg-red-500 text-white font-bold rounded-full shadow-xl active:scale-95 transform transition-transform">
          <HeartPulse size={48} className="mx-auto mb-2" />
          {count}
        </button>
      )}
      {status === 'finished' && (
        <div>
          <p className={`text-4xl font-bold ${result.success ? 'text-green-600' : 'text-red-700'}`}>{result.cpm} cpm</p>
          <p className="mb-4">{result.success ? '¡Ritmo perfecto!' : 'Intenta de nuevo.'}</p>
          {!result.success && <button onClick={handleStart} className="px-6 py-2 bg-red-600 text-white rounded">Reintentar</button>}
        </div>
      )}
    </div>
  );
});

export const BotiquinSelectionGame = memo(function BotiquinSelectionGame({ onGameComplete }: { onGameComplete: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<'playing' | 'success' | 'fail'>('playing');

  const CORRECT_ITEMS = ['Guantes', 'Gasas estériles', 'Antiséptico', 'Tiritas', 'Suero fisiológico'];
  const DISTRACTOR_ITEMS = ['Pasta de dientes', 'Móvil', 'Algodón'];
  
  const allItems = useMemo(() => [...CORRECT_ITEMS, ...DISTRACTOR_ITEMS].sort(() => Math.random() - 0.5), []);

  const handleToggle = (item: string) => {
    if (status !== 'playing') return;
    const newSet = new Set(selected);
    if (newSet.has(item)) newSet.delete(item);
    else newSet.add(item);
    setSelected(newSet);
  };

  const handleCheck = () => {
    const isCorrect = CORRECT_ITEMS.every(i => selected.has(i)) && selected.size === CORRECT_ITEMS.length;
    setStatus(isCorrect ? 'success' : 'fail');
    if (isCorrect) onGameComplete();
  };

  return (
    <div className="p-4 border-2 border-dashed border-red-300 rounded bg-red-50">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {allItems.map(item => (
          <button key={item} onClick={() => handleToggle(item)}
            className={`p-2 rounded border ${selected.has(item) ? 'bg-red-500 text-white' : 'bg-white'}`}>
            {item}
          </button>
        ))}
      </div>
      {status === 'playing' && <button onClick={handleCheck} className="bg-red-600 text-white px-4 py-2 rounded">Comprobar</button>}
      {status === 'success' && <p className="text-green-600 font-bold">¡Correcto!</p>}
      {status === 'fail' && <button onClick={() => { setStatus('playing'); setSelected(new Set()); }} className="text-red-600 underline">Reintentar</button>}
    </div>
  );
});

export const HeimlichClickGame = memo(function HeimlichClickGame({ onGameComplete }: { onGameComplete: () => void }) {
  const [message, setMessage] = useState('');
  
  const handleClick = (area: 'correct' | 'wrong') => {
    if (area === 'correct') {
      setMessage('¡Correcto!');
      onGameComplete();
    } else {
      setMessage('¡Ahí no!');
      setTimeout(() => setMessage(''), 1000);
    }
  };

  return (
    <div className="text-center relative mx-auto w-48">
        <p className="mb-2 font-semibold">Haz clic entre ombligo y esternón:</p>
        <svg viewBox="0 0 100 150" className="w-full h-auto border border-gray-200 rounded bg-sky-50">
            <path d="M20,10 C20,0 80,0 80,10 L90,100 C90,140 10,140 10,100 Z" fill="#e0f2fe" stroke="#60a5fa" strokeWidth="2" />
            <rect x="10" y="10" width="80" height="40" fill="transparent" onClick={() => handleClick('wrong')} className="cursor-pointer hover:fill-red-200" />
            <rect x="20" y="55" width="60" height="25" fill="transparent" onClick={() => handleClick('correct')} className="cursor-pointer hover:fill-green-200" />
            <rect x="10" y="90" width="80" height="50" fill="transparent" onClick={() => handleClick('wrong')} className="cursor-pointer hover:fill-red-200" />
        </svg>
        <p className="h-6 text-red-600 font-bold mt-2">{message}</p>
    </div>
  );
});