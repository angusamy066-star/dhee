import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DiagnosticLab } from './components/DiagnosticLab';
import { VeoVideoGenerator } from './components/VeoVideoGenerator';
import { OutbreakSurveillance } from './components/OutbreakSurveillance';
import { VoiceAssistant } from './components/VoiceAssistant';
import { HerdManager } from './components/HerdManager';
import { DiseaseReferenceGuide } from './components/DiseaseReferenceGuide';
import {
  Animal,
  SensorAlert,
  OutbreakWatch,
  DEFAULT_ANIMALS,
  DEFAULT_SENSOR_ALERTS,
  DEFAULT_OUTBREAK_WATCHES,
  subscribeUserAnimals,
  subscribeUserAlerts,
} from './firebase/dbService';
import { AuthProvider, useAuth } from './firebase/AuthContext';

function MainApp() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [animals, setAnimals] = useState<Animal[]>(DEFAULT_ANIMALS);
  const [alerts, setAlerts] = useState<SensorAlert[]>(DEFAULT_SENSOR_ALERTS);
  const [watches, setWatches] = useState<OutbreakWatch[]>(DEFAULT_OUTBREAK_WATCHES);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Subscribe to real-time Firestore updates when logged in
  useEffect(() => {
    if (!user) {
      setAnimals(DEFAULT_ANIMALS);
      setAlerts(DEFAULT_SENSOR_ALERTS);
      setWatches(DEFAULT_OUTBREAK_WATCHES);
      return;
    }

    const unsubAnimals = subscribeUserAnimals(
      user.uid,
      (userAnimals) => {
        if (userAnimals && userAnimals.length > 0) {
          setAnimals(userAnimals);
        } else {
          // If brand new user, show default cohort
          setAnimals(DEFAULT_ANIMALS);
        }
      },
      (err) => console.warn('Firestore animals subscription notice:', err.message)
    );

    const unsubAlerts = subscribeUserAlerts(
      user.uid,
      (userAlerts) => {
        if (userAlerts && userAlerts.length > 0) {
          setAlerts(userAlerts);
        } else {
          setAlerts(DEFAULT_SENSOR_ALERTS);
        }
      },
      (err) => console.warn('Firestore alerts subscription notice:', err.message)
    );

    return () => {
      unsubAnimals();
      unsubAlerts();
    };
  }, [user]);

  const handleSelectAnimalForDiagnosis = (animal: Animal) => {
    setSelectedAnimal(animal);
    setActiveTab('diagnose');
  };

  const unreadAlerts = alerts.filter((a) => a.status === 'new').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertCount={unreadAlerts}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            animals={animals}
            alerts={alerts}
            onSelectAnimalForDiagnosis={handleSelectAnimalForDiagnosis}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'diagnose' && (
          <DiagnosticLab
            selectedAnimal={selectedAnimal}
            onSavedReport={() => {
              // Could navigate or notify
            }}
          />
        )}

        {activeTab === 'veo' && <VeoVideoGenerator />}

        {activeTab === 'outbreaks' && (
          <OutbreakSurveillance initialWatches={watches} />
        )}

        {activeTab === 'voice' && <VoiceAssistant />}

        {activeTab === 'herd' && (
          <HerdManager
            animals={animals}
            onSelectForDiagnosis={handleSelectAnimalForDiagnosis}
          />
        )}

        {activeTab === 'guide' && <DiseaseReferenceGuide />}
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Livestock Health AI Biosurveillance & Detection Platform — Integrating wearable sensor telemetry, multimodal computer vision, and real-time Google Search grounding.
          </p>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>One Health Initiative</span>
            <span>•</span>
            <span>WOAH / USDA Compliant Diagnostics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
