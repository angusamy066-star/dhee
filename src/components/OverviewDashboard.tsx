import React from 'react';
import { Animal, SensorAlert } from '../firebase/dbService';
import { HerdTelemetryTimeSeriesChart } from './HerdTelemetryTimeSeriesChart';
import {
  Activity,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Radio,
  Thermometer,
  Zap,
} from 'lucide-react';

interface OverviewDashboardProps {
  animals: Animal[];
  alerts: SensorAlert[];
  onSelectAnimalForDiagnosis: (animal: Animal) => void;
  onNavigateTab: (tab: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  animals,
  alerts,
  onSelectAnimalForDiagnosis,
  onNavigateTab,
}) => {
  const healthyCount = animals.filter((a) => a.healthStatus === 'healthy').length;
  const monitoringCount = animals.filter((a) => a.healthStatus === 'monitoring').length;
  const quarantineCount = animals.filter((a) => a.healthStatus === 'quarantine').length;
  const criticalCount = animals.filter((a) => a.healthStatus === 'critical').length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Early Detection Mission */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Herd Health Intelligence & Biosurveillance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pre-Clinical Disease Detection & Behavioral Telemetry
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Detecting subtle deviations in rumination, feed-bunk time, ocular temperature, and gait{' '}
              <span className="font-semibold text-emerald-300">24 to 48 hours</span> before visible
              clinical signs emerge — curbing mortality, antibiotic usage, and zoonotic contagion.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center">
            <button
              onClick={() => onNavigateTab('diagnose')}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-950 flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Diagnostic Lab</span>
            </button>
            <button
              onClick={() => onNavigateTab('outbreaks')}
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Radio className="w-4 h-4 text-teal-400" />
              <span>Global Outbreak Watch</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Tracked Herd</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{animals.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Head Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cattle, Swine, Sheep, Poultry</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Early Detection Lead-Time</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-teal-400">24 - 48h</span>
            <span className="text-xs text-slate-300">Early Warning</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Prior to clinical symptom onset</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Sensor Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-400">{alerts.length}</span>
            <span className="text-xs text-amber-300 font-medium">Flagged Deviations</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Collar, Ear Tag & Vision Alarms</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Quarantine & Isolation</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-rose-400">{quarantineCount}</span>
            <span className="text-xs text-rose-300 font-medium">Animals Isolated</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Contagion containment active</p>
        </div>
      </div>

      {/* 30-Day Time-Series Recharts Visualization */}
      <HerdTelemetryTimeSeriesChart animals={animals} />

      {/* Main Grid: Telemetry Deviations & Health Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Sensor Deviations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Pre-Clinical Sensor Telemetry Feed
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Aggregated Smart Collars & Boluses
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        alert.deviationPercent < 0
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {alert.deviationPercent < 0 ? (
                        <TrendingDown className="w-5 h-5" />
                      ) : (
                        <TrendingUp className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">
                          Tag {alert.animalTag}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {alert.sensorType}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          +{alert.leadTimeHours}h Lead-Time
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-300 mt-0.5">
                        {alert.metric}:{' '}
                        <span className="text-white font-bold">{alert.currentValue}</span>{' '}
                        (vs baseline {alert.baselineValue}) —{' '}
                        <span
                          className={
                            alert.deviationPercent < 0 ? 'text-amber-400' : 'text-rose-400'
                          }
                        >
                          {alert.deviationPercent > 0 ? '+' : ''}
                          {alert.deviationPercent}% deviation
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const matched = animals.find((a) => a.tagNumber === alert.animalTag);
                      if (matched) {
                        onSelectAnimalForDiagnosis(matched);
                      } else {
                        onNavigateTab('diagnose');
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center space-x-1"
                  >
                    <span>Run AI Triage</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
                  <p className="leading-relaxed">
                    <span className="font-semibold text-amber-300">Pathology Risk: </span>
                    {alert.flaggedIssue}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Market & Industry Context Insight (from requirements) */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>Industry Benchmark & Economic Impact</span>
            </div>
            <p className="leading-relaxed">
              Global livestock diagnostics is surging from{' '}
              <span className="text-slate-200 font-bold">$7.8B (2025)</span> to{' '}
              <span className="text-emerald-400 font-bold">$18.3B (2035)</span> (CAGR 8.9%), with AI
              in animal health reaching{' '}
              <span className="text-emerald-400 font-bold">$14.24B</span>. Disease diagnosis
              represents over 28% of all veterinary AI workloads — proving that decision-support
              triage empowers livestock producers with unprecedented control over health outcomes.
            </p>
          </div>
        </div>

        {/* Right Column: Herd Health Status & Quick Animal Picker */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Herd Health Stratification</span>
              <span className="text-xs text-slate-400 font-normal">Active Cohort</span>
            </h2>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-emerald-400 font-medium">Optimal / Healthy</span>
                  <span className="text-slate-300 font-bold">{healthyCount}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(healthyCount / Math.max(1, animals.length)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-amber-400 font-medium">Under Monitoring</span>
                  <span className="text-slate-300 font-bold">{monitoringCount}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${(monitoringCount / Math.max(1, animals.length)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-rose-400 font-medium">Quarantine / Isolation</span>
                  <span className="text-slate-300 font-bold">{quarantineCount}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${(quarantineCount / Math.max(1, animals.length)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {criticalCount > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-red-500 font-medium">Critical Emergency</span>
                    <span className="text-slate-300 font-bold">{criticalCount}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full"
                      style={{
                        width: `${(criticalCount / Math.max(1, animals.length)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <p>
                Prompt quarantine of suspect cases limits pathogen reproductive number (R₀) below 1.0.
              </p>
            </div>
          </div>

          {/* Quick Animal Triage Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-white">Quick Select for Clinical Triage</h2>
            <div className="space-y-2">
              {animals.map((animal) => (
                <div
                  key={animal.id}
                  onClick={() => onSelectAnimalForDiagnosis(animal)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-600/50 hover:bg-slate-800/40 cursor-pointer transition-all text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{animal.tagNumber}</div>
                    <div className="text-[11px] text-slate-400">
                      {animal.species.toUpperCase()} • {animal.breed}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        animal.healthStatus === 'healthy'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : animal.healthStatus === 'monitoring'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {animal.healthStatus}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {animal.temperature}°C
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
