import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, appId, isMock } from './services/firebaseService';
import { Header } from './components/Common';
import { UserEntryForm, AdminPinModal } from './components/Auth';
import { MainDashboard } from './components/Dashboard';
import { ModuleViewer, ExamViewer, Certificado, DesaModal } from './components/Content';
import { modules, glossaryTerms } from './constants';
import { UserData, ProgressData, Module } from './types';
import { BookOpen, ArrowLeft } from 'lucide-react';

function App() {
  const [page, setPage] = useState('home');
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [progress, setProgress] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showDesa, setShowDesa] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    if (isMock) {
      // If using mock config, skip Firebase Auth to prevent "api-key-not-valid" errors
      console.warn("Using mock Firebase config. Switching to Offline Mode.");
      setIsOfflineMode(true);
      setUserId('offline-user');
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsOfflineMode(false);
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
        const progRef = doc(db, 'artifacts', appId, 'users', user.uid, 'progress', 'main');
        
        try {
            const uSnap = await getDoc(userRef);
            if (uSnap.exists()) setUserData(uSnap.data() as UserData);
            
            onSnapshot(progRef, (snap) => {
              if (snap.exists()) setProgress(snap.data() as ProgressData);
              setLoading(false);
            }, (err) => {
                console.error("Snapshot error:", err);
                setLoading(false);
            });
        } catch (e) {
            console.error("Error accessing Firestore:", e);
            setLoading(false);
        }
      } else {
        signInAnonymously(auth).catch((error) => {
            console.warn("Firebase Auth failed. Switching to Offline Mode.", error.message);
            // Enable offline mode so the app is still usable for demonstration
            setIsOfflineMode(true);
            setUserId('offline-user');
            setLoading(false);
        });
      }
    });
    return unsub;
  }, []);

  const handleProfileSubmit = async (data: UserData) => {
    if (!userId) return;
    setUserData(data);
    
    if (!isOfflineMode) {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'profile', 'main'), data);
            // Init empty progress if needed
            await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'progress', 'main'), {}, { merge: true });
        } catch (e) {
            console.error("Error saving profile:", e);
        }
    }
  };

  const handleModuleClick = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;

    if (mod.type === 'desa') {
        setShowDesa(true);
    } else if (mod.type === 'exam') {
        setPage('exam');
    } else if (mod.type === 'glossary') {
        setPage('glossary');
    } else if (mod.type === 'certificate') {
        setPage('certificate');
    } else {
        setCurrentModule(mod);
        setPage('module');
    }
  };

  const updateProgress = async (update: Partial<ProgressData>) => {
    if (!userId) return;
    // Optimistic update
    setProgress(prev => ({ ...prev, ...update }));
    
    if (!isOfflineMode) {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'progress', 'main'), update, { merge: true });
            // Sync to public summary
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_summaries', userId), {
                userId, name: userData?.name, role: userData?.role, progress: { ...progress, ...update }, lastUpdate: new Date().toISOString()
            }, { merge: true });
        } catch (e) { 
            console.error("Error saving progress:", e); 
        }
    }
  };

  const handleModuleComplete = () => {
    if (currentModule) {
        updateProgress({ [`${currentModule.id}Completed`]: true });
    }
    setPage('home');
    setCurrentModule(null);
  };

  const handleExamComplete = (score: number, pass: boolean) => {
    updateProgress({ examenCompleted: true, examenPassed: pass, examenScore: score });
  };

  const renderContent = () => {
    if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>;
    if (!userData) return <UserEntryForm userId={userId || ''} onProfileSubmit={handleProfileSubmit} />;

    switch (page) {
      case 'module':
        return currentModule ? <ModuleViewer module={currentModule} onComplete={handleModuleComplete} onBack={() => setPage('home')} /> : null;
      case 'exam':
        return <ExamViewer onComplete={handleExamComplete} onBack={() => setPage('home')} />;
      case 'certificate':
        return (
            <div>
                <button onClick={() => setPage('home')} className="mb-4 text-gray-600 flex items-center"><ArrowLeft className="mr-2"/> Volver</button>
                <Certificado userName={userData.name} />
            </div>
        );
      case 'glossary':
        return (
            <div className="bg-white p-6 rounded shadow max-w-3xl mx-auto">
                <button onClick={() => setPage('home')} className="mb-4 text-gray-600 flex items-center"><ArrowLeft className="mr-2"/> Volver</button>
                <h2 className="text-2xl font-bold mb-4 text-red-700 flex items-center justify-center"><BookOpen className="mr-2"/> Glosario</h2>
                <div className="space-y-4">
                    {glossaryTerms.map((t, i) => (
                        <div key={i} className="border-b pb-2"><h3 className="font-bold text-red-600">{t.term}</h3><p>{t.definition}</p></div>
                    ))}
                </div>
            </div>
        );
      case 'home':
      default:
        return <MainDashboard userData={userData} progress={progress} modules={modules} onModuleClick={handleModuleClick} onAdminLogin={() => setShowAdminPin(true)} /> isAdmin={isAdmin} onModuleClick={handleModuleClick} />
    }
  };

  return (
    <div className="pb-8">
      <Header />
      <main className="max-w-7xl mx-auto p-4 mt-4">
        {isOfflineMode && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                <p className="font-bold">Modo Demostración</p>
                <p>La conexión con la base de datos no está disponible. El progreso no se guardará permanentemente.</p>
            </div>
        )}
        {renderContent()}
      </main>
      {showAdminPin && <AdminPinModal onPinSuccess={() => { setIsAdmin(true); setShowAdminPin(false); alert("Modo Admin Activado (Log consola)"); }} onCancel={() => setShowAdminPin(false)} />}
      {showDesa && <DesaModal onClose={() => setShowDesa(false)} />}
    </div>
  );
}

export default App;
