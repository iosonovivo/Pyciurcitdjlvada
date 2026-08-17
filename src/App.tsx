import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, signOut } from './lib/firebase';

import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { RoadmapView } from './components/RoadmapView';
import { LessonView } from './components/LessonView';
import { QuizView } from './components/QuizView';
import { SetupView } from './components/SetupView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { ShopView } from './components/ShopView';
import { AuthModal } from './components/AuthModal';

import { unitsData, Lesson, componentsData, HardwareComponent } from './data/curriculumData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home'); // home, lessons, shop, profile, settings, lab_setup
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<any | null>(null);

  // Core Gamification States
  const [completedLessons, setCompletedLessons] = useState<string[]>(['led-basic']); // default unlocked
  const [xp, setXp] = useState<number>(125);
  const [streak, setStreak] = useState<number>(5);
  const [simulatorActive, setSimulatorActive] = useState<boolean>(true);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [userComponents, setUserComponents] = useState<HardwareComponent[]>([]);

  // Auth States
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Monitor Auth Status & Load Profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(true);

      if (firebaseUser) {
        // Authenticated user: Load state from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.xp !== undefined) setXp(data.xp);
            if (data.streak !== undefined) setStreak(data.streak);
            if (data.completedLessons !== undefined) setCompletedLessons(data.completedLessons);
            if (data.purchasedItems !== undefined) setPurchasedItems(data.purchasedItems);
            
            if (data.userComponents !== undefined) {
              setUserComponents(data.userComponents);
            } else {
              // Safe fallback to default components
              setUserComponents(componentsData.map(c => ({ ...c, status: 'active' })));
            }
          } else {
            const defaultComps = componentsData.map(c => ({ ...c, status: 'active' as const }));
            // Document doesn't exist yet, initialize it
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Studente',
              email: firebaseUser.email,
              xp: 125,
              streak: 5,
              completedLessons: ['led-basic'],
              purchasedItems: [],
              userComponents: defaultComps,
              createdAt: new Date().toISOString()
            });
            // Revert to defaults
            setXp(125);
            setStreak(5);
            setCompletedLessons(['led-basic']);
            setPurchasedItems([]);
            setUserComponents(defaultComps);
          }
        } catch (error) {
          console.error("Errore durante la lettura del profilo Firestore:", error);
        }
      } else {
        // Unauthenticated fallback: Load from LocalStorage if available
        const localXp = localStorage.getItem('pycircuit_xp');
        const localStreak = localStorage.getItem('pycircuit_streak');
        const localCompleted = localStorage.getItem('pycircuit_completed');
        const localPurchased = localStorage.getItem('pycircuit_purchased');
        const localComponents = localStorage.getItem('pycircuit_user_components');

        if (localXp) setXp(parseInt(localXp));
        if (localStreak) setStreak(parseInt(localStreak));
        if (localCompleted) setCompletedLessons(JSON.parse(localCompleted));
        if (localPurchased) setPurchasedItems(JSON.parse(localPurchased));
        
        if (localComponents) {
          setUserComponents(JSON.parse(localComponents));
        } else {
          setUserComponents(componentsData.map(c => ({ ...c, status: 'active' })));
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save Progress State Utility
  const saveProgress = async (
    newXp: number, 
    newStreak: number, 
    newCompleted: string[], 
    newPurchased: string[],
    newUserComponents?: HardwareComponent[]
  ) => {
    // Save to local states first
    setXp(newXp);
    setStreak(newStreak);
    setCompletedLessons(newCompleted);
    setPurchasedItems(newPurchased);
    
    if (newUserComponents) {
      setUserComponents(newUserComponents);
    }
    const activeComponents = newUserComponents || userComponents;

    if (user) {
      // Authenticated: Sync to Cloud Firestore
      const userDocRef = doc(db, 'users', user.uid);
      try {
        await updateDoc(userDocRef, {
          xp: newXp,
          streak: newStreak,
          completedLessons: newCompleted,
          purchasedItems: newPurchased,
          userComponents: activeComponents
        });
      } catch (err) {
        console.error("Impossibile aggiornare i dati su Firestore:", err);
      }
    } else {
      // Unauthenticated: Sync to LocalStorage
      localStorage.setItem('pycircuit_xp', newXp.toString());
      localStorage.setItem('pycircuit_streak', newStreak.toString());
      localStorage.setItem('pycircuit_completed', JSON.stringify(newCompleted));
      localStorage.setItem('pycircuit_purchased', JSON.stringify(newPurchased));
      localStorage.setItem('pycircuit_user_components', JSON.stringify(activeComponents));
    }
  };

  // Auth Operations
  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error("Errore durante il logout:", err.message);
    }
  };

  // Selection events
  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveTab('lesson_detail');
  };

  const handleCompleteLessonCode = () => {
    if (activeLesson && activeLesson.quiz) {
      setCurrentQuiz(activeLesson.quiz);
      setActiveTab('quiz');
    } else if (activeLesson) {
      // If no quiz, complete instantly
      const updatedLessons = completedLessons.includes(activeLesson.id)
        ? completedLessons
        : [...completedLessons, activeLesson.id];
      saveProgress(xp + 50, streak, updatedLessons, purchasedItems);
      setActiveTab('home');
      setActiveLesson(null);
    }
  };

  const handleCorrectQuizAnswer = () => {
    if (activeLesson) {
      const updatedLessons = completedLessons.includes(activeLesson.id)
        ? completedLessons
        : [...completedLessons, activeLesson.id];
      saveProgress(xp + 100, streak + 1, updatedLessons, purchasedItems);
    }
    setActiveTab('home');
    setActiveLesson(null);
    setCurrentQuiz(null);
  };

  const handleBuyShopItem = (itemId: string, itemName: string) => {
    const updatedPurchased = purchasedItems.includes(itemId)
      ? purchasedItems
      : [...purchasedItems, itemId];
    saveProgress(xp + 10, streak, completedLessons, updatedPurchased);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#070d19] text-slate-100" id="pycircuit-root">
      {/* Dynamic Tab Navigation Sidebar (Desktop) or Footer bar (Mobile) */}
      <Navigation
        activeTab={activeTab === 'settings' || activeTab === 'lab_setup' || activeTab === 'lesson_detail' || activeTab === 'quiz' ? '' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveLesson(null);
          setCurrentQuiz(null);
        }}
        openSettings={() => setActiveTab('settings')}
      />

      {/* Main Frame layout */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-y-auto" id="main-scrollable-canvas">
        {/* Universal Top Header (Except inside lessons editor to keep layout clean as shown in image) */}
        {activeTab !== 'lesson_detail' && (
          <Header
            xp={xp}
            streak={streak}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            openSettings={() => setActiveTab('settings')}
          />
        )}

        {/* LOADING ANIMATION IF RE-SYNCING FIREBASE STATUS */}
        {isLoading && user ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" id="syncing-loader">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400 font-bold tracking-wide uppercase animate-pulse">Sincronizzazione Lab Cloud in corso...</p>
          </div>
        ) : (
          <main className="flex-1 w-full" id="active-viewport">
            {/* View Switching Logic */}
            {activeTab === 'home' && (
              <RoadmapView
                units={unitsData}
                completedLessons={completedLessons}
                activeLessonId="buzzer-active" // default highlight lesson
                onSelectLesson={handleSelectLesson}
                openSetupLab={() => setActiveTab('lab_setup')}
                simulatorActive={simulatorActive}
                setSimulatorActive={setSimulatorActive}
              />
            )}

            {activeTab === 'lessons' && (
              <RoadmapView
                units={unitsData}
                completedLessons={completedLessons}
                activeLessonId="buzzer-active"
                onSelectLesson={handleSelectLesson}
                openSetupLab={() => setActiveTab('lab_setup')}
                simulatorActive={simulatorActive}
                setSimulatorActive={setSimulatorActive}
              />
            )}

            {activeTab === 'shop' && (
              <ShopView
                onBuyItem={handleBuyShopItem}
                purchasedItems={purchasedItems}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                xp={xp}
                streak={streak}
                userComponents={userComponents}
                setUserComponents={setUserComponents}
                saveProgress={saveProgress}
                completedLessons={completedLessons}
                purchasedItems={purchasedItems}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                onClose={() => setActiveTab('home')}
                xp={xp}
              />
            )}

            {activeTab === 'lab_setup' && (
              <SetupView
                onClose={() => setActiveTab('home')}
                simulatorActive={simulatorActive}
                setSimulatorActive={setSimulatorActive}
                userComponents={userComponents}
                setUserComponents={(components) => saveProgress(xp, streak, completedLessons, purchasedItems, components)}
              />
            )}

            {activeTab === 'lesson_detail' && activeLesson && (
              <LessonView
                lesson={activeLesson}
                onBack={() => {
                  setActiveTab('home');
                  setActiveLesson(null);
                }}
                onComplete={handleCompleteLessonCode}
                xp={xp}
                setXp={setXp}
              />
            )}

            {activeTab === 'quiz' && currentQuiz && (
              <QuizView
                quiz={currentQuiz}
                onCorrectAnswer={handleCorrectQuizAnswer}
                onClose={() => {
                  setActiveTab('home');
                  setActiveLesson(null);
                  setCurrentQuiz(null);
                }}
              />
            )}
          </main>
        )}
      </div>

      {/* Elegant Authentication Modal (Username & Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => console.log("Autenticazione riuscita!")}
      />
    </div>
  );
}
