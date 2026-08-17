import React, { useState } from 'react';
import { User, Download, Bell, Shield, Moon, ChevronRight, X, Sparkles } from 'lucide-react';

interface SettingsViewProps {
  onClose: () => void;
  xp: number;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClose, xp }) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsActive, setNotificationsActive] = useState(true);

  const handleDownloadOffline = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadProgress(null), 1500); // Reset
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 pb-24 space-y-6" id="settings-view-container">
      {/* Settings Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/40 rounded-lg border border-slate-800"
            id="btn-close-settings"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Impostazioni</h2>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">
          {xp} XP
        </div>
      </div>

      {/* Section 1: Account */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Account</h3>
        
        <div className="bg-[#0a1122] border border-slate-800/85 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 hover:bg-slate-800/20 transition cursor-pointer">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">Profilo Utente</p>
              <p className="text-[11px] text-slate-400">Giacomo Rossi</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </div>
      </div>

      {/* Section 2: PWA & Offline Support */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Supporto PWA & Offline</h3>

        <div className="bg-[#0a1122] border border-slate-800/85 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-white">Esporta / Scarica Lezioni Offline</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Studia anche senza connessione internet. Il progresso verrà sincronizzato appena torni online.
              </p>
            </div>
          </div>

          {/* Download button and progress bar */}
          <div className="pt-2">
            {downloadProgress === null ? (
              <button
                onClick={handleDownloadOffline}
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                id="btn-download-lessons"
              >
                <Download className="w-4 h-4" />
                <span>Scarica Tutto (45MB)</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-orange-500 h-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{downloadProgress === 100 ? 'Download completato!' : 'Download in corso...'}</span>
                  <span>{downloadProgress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 3: Preferences */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Preferenze & Sviluppo</h3>

        <div className="bg-[#0a1122] border border-slate-800/85 rounded-2xl divide-y divide-slate-800/60 overflow-hidden shadow-lg">
          {/* Row 1: Notifications */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-200">Notifiche</span>
            </div>
            <button 
              onClick={() => setNotificationsActive(!notificationsActive)}
              className="text-xs font-black text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <span className={notificationsActive ? 'text-emerald-400' : 'text-slate-500'}>
                {notificationsActive ? 'Attive' : 'Disattivate'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Row 2: Privacy */}
          <div className="p-4 flex items-center justify-between hover:bg-slate-800/10 cursor-pointer transition">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-200">Privacy</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </div>

          {/* Row 3: Dark Mode toggle */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-200">Modalità Scura</span>
            </div>
            
            {/* Custom iOS-style toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none ${
                darkMode ? 'bg-orange-500' : 'bg-slate-800'
              }`}
              id="toggle-dark-mode"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 4: Reset LocalStorage button */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-950/10">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-rose-400">Resetta Progressi Locali</span>
              <p className="text-[10px] text-slate-400">Svuota completamente la cache locale del browser (localStorage).</p>
            </div>
            
            <button
              onClick={() => {
                if (confirm("Sei sicuro di voler resettare tutti i progressi e l'inventario locale? Questa azione non può essere annullata.")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition shadow-md self-start sm:self-auto"
              id="btn-reset-localstorage"
            >
              Resetta Ora
            </button>
          </div>
        </div>
      </div>

      {/* Settings Footer */}
      <div className="text-center pt-8 text-[11px] text-slate-500 font-bold space-y-1 select-none">
        <p>Versione 2.4.0-PRO</p>
        <p className="text-slate-600">PyCircuit S.r.l.</p>
      </div>
    </div>
  );
};
