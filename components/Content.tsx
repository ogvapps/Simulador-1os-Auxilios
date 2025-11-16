import React, { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, ExternalLink, Award } from 'lucide-react';
import { Module, ProgressData } from '../types';
import { RcpRhythmGame, BotiquinSelectionGame, HeimlichClickGame } from './Games';
import { SpeakButton } from './Common.tsx';
import { examQuestions, totalExamQuestions, MIN_PASS_SCORE, glossaryTerms, DESA_SIMULATOR_URL } from '../constants';

export const ModuleViewer = ({ module, onComplete, onBack }: { module: Module, onComplete: () => void, onBack: () => void }) => {
  const [step, setStep] = useState(0);
  const [gameDone, setGameDone] = useState(false);
  const steps = module.content?.steps || [];
  const currentStep = steps[step];
  const isInteractive = !!currentStep.interactiveComponent;

  const handleNext = () => {
    setGameDone(false);
    setStep(s => s + 1);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-red-700 mb-4">{module.title}</h2>
      {module.content?.videoUrls?.map(url => (
          <a key={url} href={url} target="_blank" rel="noreferrer" className="block text-center mb-4 text-blue-600 underline"><ExternalLink className="inline w-4 h-4 mr-1"/>Ver vídeo</a>
      ))}
      <div className="mb-4 h-2 bg-gray-200 rounded-full">
        <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
      </div>
      <div className="text-center min-h-[300px] flex flex-col items-center">
        <div className="mb-4">{currentStep.icon}</div>
        <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center">
            {currentStep.title} <SpeakButton text={`${currentStep.title}. ${currentStep.text}`} />
        </h3>
        <p className="text-lg mb-6">{currentStep.text}</p>
        
        {isInteractive && (
            <div className="w-full mt-4">
                {currentStep.interactiveComponent === 'RcpGame' && <RcpRhythmGame onGameComplete={() => setGameDone(true)} />}
                {currentStep.interactiveComponent === 'BotiquinGame' && <BotiquinSelectionGame onGameComplete={() => setGameDone(true)} />}
                {currentStep.interactiveComponent === 'HeimlichGame' && <HeimlichClickGame onGameComplete={() => setGameDone(true)} />}
            </div>
        )}
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={step > 0 ? () => setStep(s => s - 1) : onBack} className="px-4 py-2 bg-gray-200 rounded font-bold">Anterior</button>
        {step < steps.length - 1 ? (
            <button onClick={handleNext} disabled={isInteractive && !gameDone} className="px-4 py-2 bg-red-600 text-white rounded font-bold disabled:opacity-50">Siguiente</button>
        ) : (
            <button onClick={onComplete} disabled={isInteractive && !gameDone} className="px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50 flex items-center">¡Completar! <CheckCircle2 size={20} className="ml-2"/></button>
        )}
      </div>
    </div>
  );
};

export const ExamViewer = ({ onComplete, onBack }: { onComplete: (score: number, pass: boolean) => void, onBack: () => void }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (opt: string) => {
    if (finished) return;
    setAnswers(prev => ({ ...prev, [current]: opt }));
  };

  const submit = () => {
    let s = 0;
    examQuestions.forEach((q, i) => { if (answers[i] === q.answer) s++; });
    setScore(s);
    setFinished(true);
    onComplete(s, s >= MIN_PASS_SCORE);
  };

  if (finished) {
    const passed = score >= MIN_PASS_SCORE;
    return (
        <div className="bg-white p-8 rounded shadow text-center">
            <h2 className="text-3xl font-bold mb-4">{passed ? '¡APROBADO!' : 'SUSPENSO'}</h2>
            <p className="text-6xl font-bold mb-4">{score} / {totalExamQuestions}</p>
            {passed ? <CheckCircle2 size={64} className="text-green-500 mx-auto"/> : <XCircle size={64} className="text-red-500 mx-auto"/>}
            <button onClick={onBack} className="mt-6 px-6 py-2 bg-gray-700 text-white rounded">Volver</button>
        </div>
    );
  }

  const q = examQuestions[current];
  return (
    <div className="bg-white p-8 rounded shadow max-w-3xl mx-auto">
        <div className="flex justify-between mb-4">
            <span>Pregunta {current + 1}/{totalExamQuestions}</span>
            <span className="text-red-600 font-bold">Examen Final</span>
        </div>
        <h3 className="text-xl font-bold mb-6">{q.question}</h3>
        <div className="space-y-3 mb-8">
            {q.options.map(opt => (
                <button key={opt} onClick={() => handleSelect(opt)} 
                    className={`w-full text-left p-4 border rounded ${answers[current] === opt ? 'bg-red-100 border-red-500' : 'hover:bg-gray-50'}`}>
                    {opt}
                </button>
            ))}
        </div>
        <div className="flex justify-between">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Anterior</button>
            {current === totalExamQuestions - 1 ? (
                <button onClick={submit} disabled={Object.keys(answers).length !== totalExamQuestions} className="px-4 py-2 bg-green-600 text-white rounded font-bold disabled:opacity-50">Finalizar</button>
            ) : (
                <button onClick={() => setCurrent(c => Math.min(totalExamQuestions - 1, c + 1))} className="px-4 py-2 bg-red-600 text-white rounded font-bold">Siguiente</button>
            )}
        </div>
    </div>
  );
};

export const Certificado = ({ userName }: { userName: string }) => (
    <div className="bg-white p-8 rounded shadow text-center border-4 border-yellow-400 bg-yellow-50 max-w-2xl mx-auto">
        <Award size={80} className="text-yellow-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Certificado de Superación</h2>
        <p className="text-xl">Se otorga a:</p>
        <h3 className="text-4xl font-bold text-red-700 my-4">{userName}</h3>
        <p>Por completar el Desafío Socorrista</p>
    </div>
);

export const DesaModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-8 rounded max-w-md text-center">
            <h3 className="text-2xl font-bold text-green-600 mb-4">¡Acceso Concedido!</h3>
            <p className="mb-6">Has desbloqueado el simulador DESA.</p>
            <a href={DESA_SIMULATOR_URL} target="_blank" rel="noreferrer" className="block w-full bg-red-600 text-white py-3 rounded font-bold mb-4">Abrir Simulador</a>
            <button onClick={onClose} className="text-gray-500 underline">Cerrar</button>
        </div>
    </div>
);