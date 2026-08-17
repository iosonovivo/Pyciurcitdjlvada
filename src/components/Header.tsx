import React from 'react';
import { Flame, Trophy, LogIn, LogOut, Settings } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  xp: number;
  streak: number;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  openSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ xp, streak, user, onLogin, onLogout, openSettings }) => {
  return (
    <header className="bg-[#0b1329] border-b border-slate-800/60 px-4 md:px-8 py-4 flex items-center justify-between z-30 shadow-md" id="app-header">
      {/* Brand title - mobile only */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-lg">
          Py
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">PyCircuit</h1>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          SunFounder Raphael Edition
        </span>
      </div>

      {/* Badges and Profile */}
      <div className="flex items-center gap-3">
        {/* Flame Streak Badge */}
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full text-orange-400 font-bold text-xs shadow-inner shadow-orange-500/5">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
          <span>{streak}</span>
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full text-blue-400 font-bold text-xs">
          <Trophy className="w-3.5 h-3.5" />
          <span>{xp} XP</span>
        </div>

        {/* Mobile Settings Icon */}
        <button
          onClick={openSettings}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/40"
          id="btn-mobile-settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Firebase Authentication Integration */}
        {user ? (
          <div className="flex items-center gap-3 bg-slate-800/30 pl-2 pr-1 py-1 rounded-full border border-slate-800">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-white max-w-[120px] truncate">{user.displayName || 'Alex'}</p>
              <p className="text-[10px] text-slate-400 max-w-[120px] truncate">{user.email}</p>
            </div>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-orange-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                {(user.displayName || 'A').charAt(0)}
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-800/50"
              title="Esci"
              id="btn-logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs px-4 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-orange-500/10 hover:scale-[1.02]"
            id="btn-login-google"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Accedi</span>
          </button>
        )}
      </div>
    </header>
  );
};
