import React, { useState } from 'react';
import { Animal, saveHealthReport, HealthReport } from '../firebase/dbService';
import { useAuth } from '../firebase/AuthContext';
import {
  Upload,
  Sparkles,
  Zap,
  BrainCircuit,
  AlertOctagon,
  ShieldCheck,
  Microscope,
  Stethoscope,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface DiagnosticLabProps {
  selectedAnimal?: Animal | null;
  onSavedReport?: () => void;
}

export const DiagnosticLab: React.FC<DiagnosticLabProps> = ({
  selectedAnimal,
  onSavedReport,
}) => {
  const { user } = useAuth();

  const [species, setSpecies] = useState<string>(selectedAnimal?.species || 'cattle');
  const [animalTag, setAnimalTag] = useState<string>(selectedAnimal?.tagNumber || 'USA-HOL-1042');
  const [symptoms, setSymptoms] = useState<string>(
    'Reduced appetite, depressed posture, decreased rumination noted on collar for the past 24 hours, mild swelling on right hind quarter.'
  );

  // Sensor telemetry inputs
  const [temperature, setTemperature] = useState<number>(selectedAnimal?.temperature || 39.4);
  const [ruminationMinutes, setRuminationMinutes] = useState<number>(
    selectedAnimal?.ruminationMinutes || 380
  );
  const [feedBunkMinutes, setFeedBunkMinutes] = useState<number>(65);
  const [stepCount, setStepCount] = useState<number>(1420);
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<number>(45);

  // Mode: high thinking (gemini-3.1-pro-preview), fast (gemini-3.1-flash-lite), general (gemini-3.5-flash)
  const [mode, setMode] = useState<'deep_differential' | 'fast_triage' | 'general'>('deep_differential');

  // Image upload
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');

  // Loading & Result
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [modelUsed, setModelUsed] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick preset loader
  const loadPreset = (presetKey: string) => {
    setErrorMsg(null);
    setDiagnosisResult(null);
    setSavedSuccess(false);

    if (presetKey === 'fmd') {
      setSpecies('cattle');
      setAnimalTag('USA-BEEF-8812');
      setSymptoms(
        'Severe sudden lameness, shifting weight between hooves. Profuse foamy salivation and lip smacking. Visible erosions and ruptured vesicles on dental pad and tongue.'
      );
      setTemperature(40.6);
      setRuminationMinutes(210);
      setFeedBunkMinutes(20);
      setStepCount(680);
      setWaterIntakeLiters(22);
      setMode('deep_differential');
    } else if (presetKey === 'mastitis') {
      setSpecies('cattle');
      setAnimalTag('USA-HOL-1042');
      setSymptoms(
        'Collar flagged 25% drop in rumination 28h ago. Slight heat and firmness in right rear udder quarter. Milk showing subtle flakes and elevated electrical conductivity on automated milker.'
      );
      setTemperature(39.4);
      setRuminationMinutes(380);
      setFeedBunkMinutes(65);
      setStepCount(1400);
      setWaterIntakeLiters(52);
      setMode('general');
    } else if (presetKey === 'asf') {
      setSpecies('swine');
      setAnimalTag('SWN-DRC-3310');
      setSymptoms(
        'High fever, lethargy, huddling together. Purplish cyanotic blotches on ears, snout, and abdomen. Bloody diarrhea noted in pen corner. Sudden loss of 2 finisher pigs overnight.'
      );
      setTemperature(41.4);
      setRuminationMinutes(0);
      setFeedBunkMinutes(15);
      setStepCount(420);
      setWaterIntakeLiters(8);
      setMode('deep_differential');
    } else if (presetKey === 'hpai') {
      setSpecies('poultry');
      setAnimalTag('AVN-ROSS-512');
      setSymptoms(
        'Severe drop in water consumption. Cyanotic dark blue combs and wattles, facial edema, greenish diarrhea, sudden spike in flock mortality across House 2.'
      );
      setTemperature(42.8);
      setRuminationMinutes(0);
      setFeedBunkMinutes(10);
      setStepCount(300);
      setWaterIntakeLiters(12);
      setMode('deep_differential');
    } else if (presetKey === 'haemonchus') {
      setSpecies('sheep');
      setAnimalTag('OVI-KAT-4028');
      setSymptoms(
        'Extreme lethargy lagging behind flock on pasture. Pale, chalky ocular conjunctiva (FAMACHA score 4). Submandibular edema ("bottle jaw") observed beneath lower jaw.'
      );
      setTemperature(39.2);
      setRuminationMinutes(410);
      setFeedBunkMinutes(50);
      setStepCount(980);
      setWaterIntakeLiters(30);
      setMode('fast_triage');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setDiagnosisResult(null);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species,
          animalTag,
          symptoms,
          imageBase64: imageBase64 || undefined,
          imageMimeType: imageMimeType,
          sensorData: {
            temperature,
            ruminationMinutes,
            feedBunkMinutes,
            stepCount,
            waterIntakeLiters,
          },
          mode,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Diagnostic evaluation failed');
      }

      const data = await response.json();
      setDiagnosisResult(data.diagnosis);
      setModelUsed(data.modelUsed);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to complete diagnostic evaluation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!diagnosisResult) return;
    try {
      const newReport: HealthReport = {
        id: `report-${Date.now()}`,
        ownerId: user?.uid || 'guest-session',
        animalTag,
        species,
        category: diagnosisResult.category || 'Infectious',
        symptoms,
        severity: diagnosisResult.severity || 'high',
        suspectedDiseases: diagnosisResult.suspectedConditions
          ?.map((c: any) => `${c.name} (${c.probability}%)`)
          .join(', ') || 'N/A',
        differentialDiagnosis: diagnosisResult.differentialDiagnosis || '',
        biosecurityAdvice: diagnosisResult.biosecurityMeasures?.join('; ') || '',
        treatmentGuidance: diagnosisResult.immediateActions?.join('; ') || '',
        zoonoticRisk: diagnosisResult.zoonoticRisk?.isZoonotic
          ? `Zoonotic Risk: ${diagnosisResult.zoonoticRisk.humanTransmissionRisk}`
          : 'Non-zoonotic',
        imageUrl: imageBase64 ? imageBase64.slice(0, 500) : undefined,
        createdAt: new Date().toISOString(),
      };

      await saveHealthReport(newReport);
      setSavedSuccess(true);
      if (onSavedReport) onSavedReport();
    } catch (err: any) {
      console.error('Error saving report to Firestore:', err);
      setErrorMsg(err.message || 'Error saving to Firestore');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with preset buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Microscope className="w-4 h-4" />
              <span>Multi-Modal Diagnostic & Clinical Reasoning Lab</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              AI Symptom, Lesion & Telemetry Triage
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Combines visual exam data, behavioral collar metrics, and deep veterinary differential logic.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Load Case:</span>
            <button
              onClick={() => loadPreset('fmd')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-rose-950/70 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-all"
            >
              FMD (Cattle)
            </button>
            <button
              onClick={() => loadPreset('mastitis')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-amber-950/70 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-all"
            >
              Early Mastitis
            </button>
            <button
              onClick={() => loadPreset('asf')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-purple-950/70 text-purple-300 border border-purple-800 hover:bg-purple-900 transition-all"
            >
              Swine Fever
            </button>
            <button
              onClick={() => loadPreset('hpai')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-teal-950/70 text-teal-300 border border-teal-800 hover:bg-teal-900 transition-all"
            >
              Avian Flu H5N1
            </button>
            <button
              onClick={() => loadPreset('haemonchus')}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 transition-all"
            >
              Barber Pole Worm
            </button>
          </div>
        </div>

        {/* Intelligence Engine Mode Picker */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => setMode('deep_differential')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              mode === 'deep_differential'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <BrainCircuit className="w-4 h-4" />
              <span>High Thinking Differential</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-1">
              Model: <span className="text-white font-mono">gemini-3.1-pro-preview</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Deep epidemiological chain-of-thought, pathogen etiology, necropsy & molecular lab test planning.
            </p>
          </div>

          <div
            onClick={() => setMode('general')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              mode === 'general'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Standard Clinical Evaluation</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-1">
              Model: <span className="text-white font-mono">gemini-3.5-flash</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Balanced speed and accuracy for daily herd health checks and treatment guidance.
            </p>
          </div>

          <div
            onClick={() => setMode('fast_triage')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              mode === 'fast_triage'
                ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>Fast Point-of-Care Triage</span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium mt-1">
              Model: <span className="text-white font-mono">gemini-3.1-flash-lite</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Ultra-low latency instant checks for high-volume chute inspections and emergency sorting.
            </p>
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Species, Tag, Symptoms, Image */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Species</label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="cattle">Cattle (Bovine)</option>
                  <option value="swine">Swine (Porcine)</option>
                  <option value="poultry">Poultry (Avian)</option>
                  <option value="sheep">Sheep (Ovine)</option>
                  <option value="goat">Goat (Caprine)</option>
                  <option value="other">Other Livestock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Animal ID / Tag</label>
                <input
                  type="text"
                  value={animalTag}
                  onChange={(e) => setAnimalTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. USA-HOL-1042"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observed Clinical Symptoms, Posture & Gait
              </label>
              <textarea
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                placeholder="Describe posture, nasal discharge, gait stiffness, eye condition, udder firmness, coughing..."
              />
            </div>

            {/* Image / Lesion / Thermal Scan Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Visual Inspection / Thermal Photo (Optional)</span>
                {imageBase64 && (
                  <button
                    onClick={() => setImageBase64(null)}
                    className="text-[10px] text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Remove image
                  </button>
                )}
              </label>

              {imageBase64 ? (
                <div className="relative rounded-xl overflow-hidden border border-emerald-500/50 max-h-48 group">
                  <img
                    src={imageBase64}
                    alt="Clinical scan"
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-semibold text-emerald-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-emerald-500/40">
                      Lesion / Inspection Visual Loaded
                    </span>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/40">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-300">
                    Upload Lesion, Hoof, Eye, Udder or Thermal Image
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Supports JPG, PNG, WebP (Computer Vision Analysis)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Right: Sensor & Telemetry Data (Smart Collars/Boluses/Ear Tags) */}
          <div className="space-y-4 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Wearable Sensor & Behavioral Telemetry</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Pre-Clinical Indicators
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Body / Ear Temperature:</span>
                  <span className="font-bold text-white font-mono">{temperature.toFixed(1)} °C</span>
                </div>
                <input
                  type="range"
                  min="36.0"
                  max="43.0"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Normal ~38.5°C</span>
                  <span>Sub-febrile 39.5°C</span>
                  <span className="text-rose-400 font-semibold">High Fever &gt;40.5°C</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Rumination Duration:</span>
                  <span className="font-bold text-white font-mono">{ruminationMinutes} min/day</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="600"
                  step="10"
                  value={ruminationMinutes}
                  onChange={(e) => setRuminationMinutes(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span className="text-rose-400 font-semibold">Severe Drop (&lt;300 min)</span>
                  <span>Normal ~480-540 min</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Feed Bunk (min)</label>
                  <input
                    type="number"
                    value={feedBunkMinutes}
                    onChange={(e) => setFeedBunkMinutes(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Step Count</label>
                  <input
                    type="number"
                    value={stepCount}
                    onChange={(e) => setStepCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Water Intake (L)</label>
                  <input
                    type="number"
                    value={waterIntakeLiters}
                    onChange={(e) => setWaterIntakeLiters(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
                💡 <span className="font-semibold text-emerald-300">Detection Advantage:</span>{' '}
                Collar rumination drop combined with reduced feed-bunk duration flags subclinical
                illness up to 36 hours before physical udder swelling or nasal discharge appears!
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 transition-all shadow-lg shadow-emerald-950 disabled:opacity-60 flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>
                      {mode === 'deep_differential'
                        ? 'Synthesizing High-Thinking Differential...'
                        : 'Evaluating Clinical Data...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Microscope className="w-4 h-4" />
                    <span>Run Multimodal Clinical Diagnosis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Diagnosis Results Section */}
      {diagnosisResult && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Top Result Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                    diagnosisResult.severity === 'critical'
                      ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
                      : diagnosisResult.severity === 'high'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {diagnosisResult.severity} Severity
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {diagnosisResult.category} Category
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Model: {modelUsed}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Diagnostic Assessment: {diagnosisResult.summary}
              </h3>
            </div>

            <button
              onClick={handleSaveToFirestore}
              disabled={savedSuccess}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all ${
                savedSuccess
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Report Saved to Firestore!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Record to Firestore</span>
                </>
              )}
            </button>
          </div>

          {/* Suspected Conditions Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Differential Etiology & Probable Conditions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {diagnosisResult.suspectedConditions?.map((cond: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sm text-white">{cond.name}</span>
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {cond.probability}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{cond.rationale}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Differential Analysis */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Veterinary Differential Rationale & Pathophysiology</span>
            </h4>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {diagnosisResult.differentialDiagnosis}
            </p>
          </div>

          {/* Diagnostic Testing Plan (Point-of-Care rapid tests vs Confirmatory PCR/ELISA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-bold">
                <Microscope className="w-4 h-4" />
                <span>Field Point-of-Care & Rapid Tests</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {diagnosisResult.diagnosticTestingPlan?.pointOfCare ||
                  'Lateral flow strip, California Mastitis Test, or rapid blood ketone evaluation.'}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                <Microscope className="w-4 h-4" />
                <span>Confirmatory Laboratory Testing (PCR / ELISA)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {diagnosisResult.diagnosticTestingPlan?.confirmatoryLab ||
                  'Definitive molecular RT-PCR, serological ELISA, and bacterial culture with antimicrobial susceptibility.'}
              </p>
            </div>
          </div>

          {/* Zoonotic Warnings & Biosecurity Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                diagnosisResult.zoonoticRisk?.isZoonotic
                  ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                  : 'bg-emerald-950/30 border-emerald-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Zoonotic Spillover & Human Risk Assessment</span>
              </div>
              <p className="leading-relaxed">
                {diagnosisResult.zoonoticRisk?.isZoonotic
                  ? `WARNING: Pathogen exhibits cross-species zoonotic potential (${diagnosisResult.zoonoticRisk.humanTransmissionRisk} risk). Required PPE: ${diagnosisResult.zoonoticRisk.protectivePPE}`
                  : 'Low to negligible human transmission risk. Standard farm biosecurity gloves and overalls advised.'}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Biosecurity Containment & Disinfection</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {diagnosisResult.biosecurityMeasures?.map((measure: string, i: number) => (
                  <li key={i}>{measure}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
