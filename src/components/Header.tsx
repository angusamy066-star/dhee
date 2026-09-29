import React from 'react';
import { useAuth } from '../firebase/AuthContext';
import {
  Activity,
  ShieldCheck,
  LogIn,
  LogOut,
  UserCheck,
  CloudCheck,
  Stethoscope,
  Radio,
  Flame,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertCount,
}) => {
  const { user, signInWithGoogle, logOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-900/40">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  Livestock <span className="text-emerald-400">Health AI</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  Precision Bio-Surveillance
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Livestock Disease & Early Behavioral Health Detection Platform
              </p>
            </div>
          </div>

          {/* User Auth & Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-emerald-400"
                  />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                )}
                <div className="hidden md:block text-left">
                  <p className="font-medium text-slate-200 leading-none truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <CloudCheck className="w-3 h-3" /> Firestore Synced
                  </span>
                </div>
                <button
                  onClick={logOut}
                  title="Sign Out"
                  className="p-1 hover:text-rose-400 transition-colors text-slate-400"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-sm shadow-emerald-950 border border-emerald-500/30"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/70 text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Herd Telemetry & Sensors</span>
            {unreadAlertCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('diagnose')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'diagnose'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>AI Diagnostic & Vision Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('veo')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'veo'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-indigo-400" />
            <span>Veo 3.1 Movement Lab</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-900/60 text-indigo-200 uppercase font-semibold">
              Video
            </span>
          </button>

          <button
            onClick={() => setActiveTab('outbreaks')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'outbreaks'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span>Search Grounded Outbreaks</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-teal-900/60 text-teal-200 uppercase font-semibold">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'voice'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>🎙️ Hands-Free Barn Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('herd')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'herd'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Herd Registry & Isolation</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'guide'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>📚 Pathology Compendium</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
