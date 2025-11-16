import React, { useMemo, memo } from 'react';
import { HeartPulse, Users, CheckCircle2, Lock, AlertTriangle, XCircle } from 'lucide-react';
import { Module, ProgressData, UserData, Badge } from '../types';
import { iconComponents, learningModuleIds, totalLearningModules, badgeData, totalExamQuestions } from '../constants';

export const ModuleCard = memo(function ModuleCard({ module, progress, onModuleClick }: { module: Module, progress: ProgressData, onModuleClick: () => void }) {
  const isLearning = module.type === 'module';
  const isCompleted = isLearning && !!progress[`${module.id}Completed`];
  
  const { isLocked, statusText, statusColor, isDisabled } = useMemo(() => {
    const allLearned = learningModuleIds.every(id => progress[`${id}Completed`]);
    const examPassed = !!progress.examenPassed;

    if (module.type === 'exam') {
      return {
        isLocked: !allLearned,
        statusText: allLearned ? '¡Listo!' : `Faltan módulos`,
        statusColor: allLearned ? 'text-green-600' : 'text-yellow-700',
        isDisabled: false
      };
    }
    if (module.type === 'certificate' || module.type === 'desa') {
      const unlocked = allLearned && examPassed;
      return {
        isLocked: !unlocked,
        statusText: unlocked ? '¡Desbloqueado!' : 'Supera el examen',
        statusColor: unlocked ? 'text-green-600' : 'text-yellow-700',
        isDisabled: !unlocked
      };
    }
    return { isLocked: false, statusText: '', statusColor: '', isDisabled: false };
  }, [module.type, progress]);

  return (
    <button
      onClick={onModuleClick}
      disabled={isDisabled}
      className={`relative bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col items-center text-center border-b-4 
      ${isCompleted ? 'border-green-500' : 'border-red-600'} 
      ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:-translate-y-1'}`}
    >
      {isCompleted && <CheckCircle2 className="absolute top-3 right-3 text-green-500" size={24} />}
      {isLocked && <Lock className="absolute top-3 left-3 text-gray-500" size={24} />}
      <div className="mb-4">{iconComponents[module.icon]}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-grow">{module.description}</p>
      {statusText && <p className={`font-semibold text-sm ${statusColor}`}>{statusText}</p>}
    </button>
  );
});

export const UserProfile = memo(function UserProfile({ progress, userName }: { progress: ProgressData, userName: string }) {
  const unlockedBadges = badgeData.filter(b => progress[`${b.id.replace('Completed', '')}Completed`]).length;
  const examStatus = progress.examenCompleted ? (progress.examenPassed ? 'APROBADO' : 'SUSPENSO') : 'PENDIENTE';
  const examColor = progress.examenPassed ? 'text-green-600' : (progress.examenCompleted ? 'text-red-600' : 'text-gray-600');

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold">Progreso de {userName}</h2>
        <div className="text-right">
            <p className="text-sm text-gray-600">Insignias: {unlockedBadges}/{badgeData.length}</p>
            <p className={`font-bold text-sm ${examColor}`}>Examen: {examStatus}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
        {badgeData.map(badge => (
            <div key={badge.id} className={`flex flex-col items-center p-2 rounded border ${progress[`${badge.id.replace('Completed', '')}Completed`] ? 'bg-white border-gray-200' : 'bg-gray-100 grayscale opacity-50'}`} title={badge.title}>
                <div className={badge.color}>{badge.icon}</div>
            </div>
        ))}
      </div>
    </div>
  );
});

export const MainDashboard = memo(function MainDashboard({ 
  userData, progress, modules, onModuleClick, onAdminLogin 
}: any) {
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-l-4 border-red-600">
        <div className="flex items-center mb-3">
          <HeartPulse size={36} className="text-red-600 mr-4" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¡Hola, {userData.name}!</h2>
            <p className="text-gray-600 text-sm">{userData.role}</p>
          </div>
        </div>
        <p className="text-gray-700 mb-4">Completa los módulos y el examen para obtener tu certificado.</p>
        <button onClick={onAdminLogin} className="text-sm flex items-center text-gray-500 hover:text-gray-800">
            <Users size={16} className="mr-1" /> Acceso Admin
        </button>
      </div>
      <UserProfile progress={progress} userName={userData.name} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m: Module) => (
            <ModuleCard key={m.id} module={m} progress={progress} onModuleClick={() => onModuleClick(m.id)} />
        ))}
      </div>
    </div>
  );
});