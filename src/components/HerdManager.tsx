import React, { useState } from 'react';
import { Animal, saveAnimal, removeAnimal } from '../firebase/dbService';
import { useAuth } from '../firebase/AuthContext';
import {
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  Stethoscope,
  Filter,
  CheckCircle2,
  Tag,
  MapPin,
  Calendar,
} from 'lucide-react';

interface HerdManagerProps {
  animals: Animal[];
  onSelectForDiagnosis: (animal: Animal) => void;
}

export const HerdManager: React.FC<HerdManagerProps> = ({
  animals,
  onSelectForDiagnosis,
}) => {
  const { user } = useAuth();

  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // New Animal Form State
  const [newTag, setNewTag] = useState('');
  const [newSpecies, setNewSpecies] = useState<'cattle' | 'swine' | 'poultry' | 'sheep' | 'goat' | 'other'>('cattle');
  const [newBreed, setNewBreed] = useState('Holstein Dairy');
  const [newAge, setNewAge] = useState(24);
  const [newPen, setNewPen] = useState('Pen 1');
  const [newStatus, setNewStatus] = useState<'healthy' | 'monitoring' | 'quarantine' | 'critical'>('healthy');
  const [newTemp, setNewTemp] = useState(38.8);
  const [newRumination, setNewRumination] = useState(500);

  const handleCreateAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    const animal: Animal = {
      id: `animal-${Date.now()}`,
      ownerId: user?.uid || 'guest-session',
      tagNumber: newTag.trim(),
      species: newSpecies,
      breed: newBreed,
      ageMonths: Number(newAge) || 12,
      penOrPasture: newPen,
      healthStatus: newStatus,
      lastCheckup: new Date().toISOString().split('T')[0],
      temperature: Number(newTemp) || 38.6,
      ruminationMinutes: Number(newRumination) || 500,
      feedIntakePercent: 95,
      activityIndex: 85,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveAnimal(animal);
    setIsAdding(false);
    setNewTag('');
  };

  const handleStatusChange = async (animal: Animal, nextStatus: 'healthy' | 'monitoring' | 'quarantine' | 'critical') => {
    const updated: Animal = {
      ...animal,
      healthStatus: nextStatus,
      updatedAt: new Date().toISOString(),
    };
    await saveAnimal(updated);
  };

  const handleDelete = async (animalId: string) => {
    await removeAnimal(animalId);
  };

  const filtered = animals.filter((a) => {
    if (filterSpecies !== 'all' && a.species !== filterSpecies) return false;
    if (filterStatus !== 'all' && a.healthStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Herd Health Registry & Quarantine Isolation Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Individual Livestock Records & Traceability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Track identification tags, health classifications, vital signs, and quarantine isolation protocols.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-950 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Enroll New Livestock'}</span>
        </button>
      </div>

      {/* Add Animal Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateAnimal}
          className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-4"
        >
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Enroll New Animal into Traceability Registry</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tag / ID Number</label>
              <input
                type="text"
                required
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="e.g. USA-HOL-9901"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Species</label>
              <select
                value={newSpecies}
                onChange={(e) => setNewSpecies(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="cattle">Cattle</option>
                <option value="swine">Swine</option>
                <option value="poultry">Poultry</option>
                <option value="sheep">Sheep</option>
                <option value="goat">Goat</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Breed</label>
              <input
                type="text"
                value={newBreed}
                onChange={(e) => setNewBreed(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pen / Pasture</label>
              <input
                type="text"
                value={newPen}
                onChange={(e) => setNewPen(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Health Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="healthy">Healthy</option>
                <option value="monitoring">Monitoring</option>
                <option value="quarantine">Quarantine</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={newTemp}
                onChange={(e) => setNewTemp(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Save Animal to Registry
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-300">Filters:</span>
          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white"
          >
            <option value="all">All Species</option>
            <option value="cattle">Cattle</option>
            <option value="swine">Swine</option>
            <option value="poultry">Poultry</option>
            <option value="sheep">Sheep</option>
            <option value="goat">Goat</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-white"
          >
            <option value="all">All Health Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="monitoring">Monitoring</option>
            <option value="quarantine">Quarantine</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <span className="text-slate-400">
          Showing <span className="font-bold text-white">{filtered.length}</span> of {animals.length} head
        </span>
      </div>

      {/* Animals Cards / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((animal) => (
          <div
            key={animal.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-sm space-y-3 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">{animal.tagNumber}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {animal.species.toUpperCase()} • {animal.breed} ({animal.ageMonths} mo)
                </div>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                  animal.healthStatus === 'healthy'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : animal.healthStatus === 'monitoring'
                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                {animal.healthStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-slate-400">Location:</span>
                <p className="font-medium text-slate-200 truncate">{animal.penOrPasture}</p>
              </div>
              <div>
                <span className="text-slate-400">Body Temp:</span>
                <p
                  className={`font-mono font-bold ${
                    animal.temperature > 40.0 ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {animal.temperature}°C
                </p>
              </div>
              <div>
                <span className="text-slate-400">Rumination:</span>
                <p className="font-medium text-slate-200">{animal.ruminationMinutes} min</p>
              </div>
              <div>
                <span className="text-slate-400">Feed Intake:</span>
                <p className="font-medium text-slate-200">{animal.feedIntakePercent}%</p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => onSelectForDiagnosis(animal)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Run Triage</span>
              </button>

              <div className="flex items-center space-x-2">
                {animal.healthStatus !== 'quarantine' ? (
                  <button
                    onClick={() => handleStatusChange(animal, 'quarantine')}
                    title="Move to Quarantine"
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900"
                  >
                    Isolate
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(animal, 'healthy')}
                    title="Clear from Quarantine"
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
                  >
                    Clear
                  </button>
                )}

                <button
                  onClick={() => handleDelete(animal.id)}
                  title="Remove Animal"
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
