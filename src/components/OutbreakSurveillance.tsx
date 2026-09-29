import React, { useState } from 'react';
import { OutbreakWatch, saveOutbreakWatch } from '../firebase/dbService';
import { useAuth } from '../firebase/AuthContext';
import {
  Radio,
  Search,
  ExternalLink,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertTriangle,
  Globe,
  RefreshCw,
} from 'lucide-react';

interface OutbreakSurveillanceProps {
  initialWatches: OutbreakWatch[];
}

export const OutbreakSurveillance: React.FC<OutbreakSurveillanceProps> = ({
  initialWatches,
}) => {
  const { user } = useAuth();

  const [query, setQuery] = useState(
    'current Foot-and-mouth disease outbreaks and avian influenza H5N1 dairy cattle poultry alerts 2025 2026 quarantine zones'
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const runSearch = async (customQuery?: string) => {
    const q = customQuery || query;
    setIsSearching(true);
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/search-outbreaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to retrieve outbreak intelligence');
      }

      const data = await res.json();
      setSearchResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error executing search grounding');
    } finally {
      setIsSearching(false);
    }
  };

  const saveCurrentToFirestore = async () => {
    if (!searchResult) return;
    try {
      const watch: OutbreakWatch = {
        id: `watch-${Date.now()}`,
        ownerId: user?.uid || 'guest-session',
        diseaseName: query.slice(0, 100),
        region: 'Global Surveillance (Search Grounded)',
        alertLevel: 'warning',
        summary: searchResult.text.slice(0, 1800),
        preventativeProtocol:
          'Enforce strict transport wash-down, isolate all incoming stock for 30 days, maintain active barrier perimeter.',
        createdAt: new Date().toISOString(),
      };

      await saveOutbreakWatch(watch);
      setSavedSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save to Firestore');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Real-Time Google Search Grounding Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Global & Regional Livestock Epidemic Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Powered by <span className="text-teal-300 font-mono font-semibold">gemini-3.5-flash</span> with{' '}
              <span className="text-teal-300 font-semibold">googleSearch tool</span> grounding for live WOAH, USDA APHIS, and EFSA disease alerts.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Hotspots:</span>
            <button
              onClick={() => {
                const q = 'Foot-and-Mouth Disease FMD current outbreaks quarantine zones livestock trade bans';
                setQuery(q);
                runSearch(q);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-teal-950 text-teal-300 border border-teal-800 hover:bg-teal-900 transition-all"
            >
              FMD Outbreaks
            </button>
            <button
              onClick={() => {
                const q = 'Avian Influenza H5N1 cattle dairy herds and poultry surveillance alerts USDA WOAH';
                setQuery(q);
                runSearch(q);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 transition-all"
            >
              HPAI H5N1 Cattle & Poultry
            </button>
            <button
              onClick={() => {
                const q = 'African Swine Fever ASF wild boar domestic pigs quarantine border updates';
                setQuery(q);
                runSearch(q);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-all"
            >
              African Swine Fever
            </button>
            <button
              onClick={() => {
                const q = 'Bluetongue virus BTV-3 sheep cattle midge vector spread vaccine approval';
                setQuery(q);
                runSearch(q);
              }}
              className="px-2.5 py-1 text-xs rounded-lg font-medium bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900 transition-all"
            >
              Bluetongue BTV-3
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-teal-500 shadow-inner"
              placeholder="Query pathogen, geographic region, species, or quarantine status..."
            />
          </div>

          <button
            onClick={() => runSearch()}
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md shadow-teal-950 disabled:opacity-50 flex items-center space-x-2 shrink-0"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching Grounded Web...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Search Live Advisories</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Search Result Display */}
      {searchResult && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  Google Search Grounded
                </span>
                <span className="text-xs text-slate-400">
                  Verified with Live Global Veterinary Advisories
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Epidemiological Intelligence Briefing</h3>
            </div>

            <button
              onClick={saveCurrentToFirestore}
              disabled={savedSuccess}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center space-x-2 transition-all ${
                savedSuccess
                  ? 'bg-teal-600/30 text-teal-300 border border-teal-500/50'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-md'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Pinned to Herd Watchlist!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Pin to Herd Watchlist</span>
                </>
              )}
            </button>
          </div>

          {/* Text Content */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans">
            {searchResult.text}
          </div>

          {/* Web Sources & Grounding Citations */}
          {searchResult.sources && searchResult.sources.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Grounding Verification Sources & Citations
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {searchResult.sources.map((src: any, index: number) => (
                  <a
                    key={index}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40 transition-all text-xs flex items-center justify-between group"
                  >
                    <span className="truncate text-slate-300 group-hover:text-teal-300 font-medium">
                      {src.title}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monitored Watchlist Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Active Herd Biosecurity Watchlist & Movement Restrictions</span>
          </h3>
          <span className="text-xs text-slate-400">{initialWatches.length} Monitored Pathogens</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {initialWatches.map((watch) => (
            <div
              key={watch.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-sm hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      watch.alertLevel === 'emergency'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : watch.alertLevel === 'quarantine'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-teal-950 text-teal-300 border-teal-800'
                    }`}
                  >
                    {watch.alertLevel}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1.5">{watch.diseaseName}</h4>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Region:</span> {watch.region}
              </p>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {watch.summary}
              </p>

              <div className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-emerald-400">Protocol: </span>
                {watch.preventativeProtocol}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
