import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  CheckCircle2, Award, Wrench, Bug, Lightbulb, Activity, Eye, 
  Thermometer, ShieldAlert, Sparkles, Lock, Plus, Link2, 
  Trash2, Bell, Cpu, AlertCircle, Loader2, Compass
} from 'lucide-react';
import { achievementsData, HardwareComponent } from '../data/curriculumData';

interface ProfileViewProps {
  user: FirebaseUser | null;
  xp: number;
  streak: number;
  userComponents: HardwareComponent[];
  setUserComponents: (components: HardwareComponent[]) => void;
  saveProgress: (newXp: number, newStreak: number, newCompleted: string[], newPurchased: string[], newUserComponents?: HardwareComponent[]) => void;
  completedLessons: string[];
  purchasedItems: string[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  user, 
  xp, 
  streak,
  userComponents,
  setUserComponents,
  saveProgress,
  completedLessons,
  purchasedItems
}) => {
  const profileName = user?.displayName || 'Alex';
  const profileEmail = user?.email || 'alex.explorer@pycircuit.io';

  // Manual Component State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [compName, setCompName] = useState<string>('');
  const [compType, setCompType] = useState<HardwareComponent['type']>('Sensor');
  const [compIcon, setCompIcon] = useState<HardwareComponent['icon']>('cpu');

  // Amazon Link Parsing State
  const [amazonUrl, setAmazonUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [discoveredComponents, setDiscoveredComponents] = useState<HardwareComponent[]>([]);

  const stats = [
    { id: '1', count: completedLessons.length.toString(), label: 'LESSONS DONE', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
    { id: '2', count: '12', label: 'BADGES EARNED', icon: Award, color: 'text-amber-400 bg-amber-500/10' },
    { id: '3', count: purchasedItems.length.toString(), label: 'ITEMS BOUGHT', icon: Wrench, color: 'text-blue-400 bg-blue-500/10' },
    { id: '4', count: '156', label: 'BUGS SQUASHED', icon: Bug, color: 'text-rose-400 bg-rose-500/10' },
  ];

  const getComponentIcon = (iconName: string) => {
    switch (iconName) {
      case 'led':
        return Lightbulb;
      case 'eye':
        return Eye;
      case 'settings':
        return Wrench;
      case 'thermometer':
        return Thermometer;
      case 'bell':
        return Bell;
      case 'cpu':
      default:
        return Cpu;
    }
  };

  // Add Component Manually
  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    const newComponent: HardwareComponent = {
      id: `custom-${Date.now()}`,
      name: compName.trim(),
      type: compType,
      icon: compIcon,
      status: 'active'
    };

    const updated = [...userComponents, newComponent];
    setUserComponents(updated);
    saveProgress(xp + 15, streak, completedLessons, purchasedItems, updated); // +15 XP for adding custom components!

    // Reset Form
    setCompName('');
    setShowAddForm(false);
  };

  // Delete Component
  const handleDeleteComponent = (id: string) => {
    const updated = userComponents.filter(c => c.id !== id);
    setUserComponents(updated);
    saveProgress(xp, streak, completedLessons, purchasedItems, updated);
  };

  // Analyze Amazon Link using real Gemini AI endpoint
  const handleAnalyzeLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amazonUrl.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setDiscoveredComponents([]);

    try {
      const response = await fetch('/api/analyze-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: amazonUrl.trim() })
      });

      if (!response.ok) {
        throw new Error('Errore durante la scansione. Riprova più tardi.');
      }

      const data = await response.json();
      if (data.success && data.components) {
        setDiscoveredComponents(data.components);
      } else {
        throw new Error('Impossibile estrarre componenti validi da questo link.');
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Errore imprevisto di scansione.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmDiscovered = () => {
    if (discoveredComponents.length === 0) return;

    const updated = [...userComponents, ...discoveredComponents];
    setUserComponents(updated);
    saveProgress(xp + (discoveredComponents.length * 30), streak, completedLessons, purchasedItems, updated); // +30 XP per ogni pezzo scoperto!
    
    // Clear Amazon state
    setAmazonUrl('');
    setDiscoveredComponents([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24 space-y-10" id="profile-view-container">
      {/* Avatar Header Panel */}
      <div className="bg-[#121c35] border border-slate-800/80 rounded-3xl p-6 md:p-8 text-center space-y-4 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="relative w-24 h-24 mx-auto mb-2">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full border-4 border-orange-500 object-cover shadow-xl"
              />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                alt="Avatar fallback"
                className="w-24 h-24 rounded-full border-4 border-orange-500 object-cover shadow-xl"
              />
            )}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-amber-300">
              LVL {Math.max(1, Math.floor(xp / 500) + 1)}
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">{profileName}</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">Hardware Enthusiast & Python Explorer</p>
          <p className="text-[10px] text-slate-500">{profileEmail}</p>

          {/* XP Progress metrics */}
          <div className="max-w-md mx-auto pt-4 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-slate-400">TOTAL PROGRESS</span>
              <span className="font-extrabold text-white">{xp} XP</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (xp / 3000) * 100)}%` }}
              />
            </div>
          </div>

          {/* Current Streak badge */}
          <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full text-orange-400 font-extrabold text-xs mt-4">
            <span>🔥 {streak} Days Streak</span>
          </div>
        </div>

        {/* Backdrop Visual glow */}
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid Statistics matching screen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="profile-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-[#0a1122] border border-slate-800/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-2 shadow-lg"
            >
              <div className={`p-2.5 rounded-xl ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">{stat.count}</h3>
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Component shelf slider */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">I miei componenti</h3>
            <p className="text-xs text-slate-400">Componenti elettronici fisici registrati nel tuo inventario personale.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md"
              id="btn-toggle-add-comp"
            >
              <Plus className="w-4 h-4" />
              <span>Nuovo Componente</span>
            </button>
          </div>
        </div>

        {/* Manual Add Form Overlay */}
        {showAddForm && (
          <form 
            onSubmit={handleAddComponent} 
            className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
            id="manual-add-comp-form"
          >
            <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Aggiungi Manualmente</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Nome Componente</label>
                <input
                  type="text"
                  required
                  placeholder="Es: Sensore Gas MQ-2"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tipologia</label>
                <select
                  value={compType}
                  onChange={(e) => setCompType(e.target.value as HardwareComponent['type'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="Sensor">Sensor</option>
                  <option value="Actuator">Actuator</option>
                  <option value="Input Device">Input Device</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Temp/Humidity">Temp/Humidity</option>
                </select>
              </div>

              {/* Icon */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Icona</label>
                <select
                  value={compIcon}
                  onChange={(e) => setCompIcon(e.target.value as HardwareComponent['icon'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500 transition"
                >
                  <option value="cpu">Generic Microchip (CPU)</option>
                  <option value="led">Lightbulb (LED)</option>
                  <option value="eye">Eye (Sensor/PIR)</option>
                  <option value="settings">Settings (Servo/Mech)</option>
                  <option value="thermometer">Thermometer (DHT)</option>
                  <option value="bell">Bell (Buzzer)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
              >
                Salva Pezzo
              </button>
            </div>
          </form>
        )}

        {/* Amazon AI Analyzer Card */}
        <div className="bg-gradient-to-r from-orange-600/10 to-amber-600/5 border border-orange-500/10 rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Scansione Link Amazon AI</span>
                <span className="text-[9px] uppercase tracking-widest font-black bg-orange-400 text-slate-950 px-2 py-0.5 rounded-full">
                  Gemini Grounding
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">Incolla un link Amazon per estrarre e aggiungere automaticamente i componenti hardware.</p>
            </div>
          </div>

          <form onSubmit={handleAnalyzeLink} className="flex gap-2" id="amazon-ai-parser-form">
            <input
              type="url"
              required
              disabled={isAnalyzing}
              placeholder="Incolla link prodotto Amazon (es: https://www.amazon.it/dp/...)"
              value={amazonUrl}
              onChange={(e) => setAmazonUrl(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-orange-500/50 transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !amazonUrl.trim()}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shrink-0 disabled:opacity-40"
              id="btn-trigger-ai-link"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analisi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analizza</span>
                </>
              )}
            </button>
          </form>

          {/* Loading status details */}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-[10px] text-orange-400 font-bold tracking-wider uppercase animate-pulse">
              <span>Scansione del prodotto Amazon con Gemini AI in corso...</span>
            </div>
          )}

          {/* Analysis Error */}
          {analysisError && (
            <div className="flex items-start gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Extracted Discovered Components Results */}
          {discoveredComponents.length > 0 && (
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Discovered {discoveredComponents.length} Components!</span>
                </span>
                <button
                  type="button"
                  onClick={handleConfirmDiscovered}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition"
                >
                  Aggiungi all'Inventario (+{discoveredComponents.length * 30} XP)
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {discoveredComponents.map((item) => {
                  const Icon = getComponentIcon(item.icon);
                  return (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold text-white truncate">{item.name}</p>
                        <p className="text-[9px] text-slate-500 truncate">{item.type}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Display Components Shelf */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="components-slider-shelf">
          {userComponents.map((comp) => {
            const Icon = getComponentIcon(comp.icon);
            return (
              <div
                key={comp.id}
                className="bg-[#0a1122] border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center text-center space-y-3 transition-all hover:border-slate-700 hover:scale-[1.02] relative group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{comp.name}</h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">{comp.type}</p>
                </div>

                {/* Delete button (only on hover) */}
                <button
                  type="button"
                  onClick={() => handleDeleteComponent(comp.id)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition duration-200"
                  title="Elimina"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {userComponents.length === 0 && (
            <div className="col-span-full py-8 text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-2xl text-slate-500 space-y-1">
              <Compass className="w-8 h-8 mx-auto text-slate-700" />
              <p className="text-xs font-bold">Nessun componente registrato</p>
              <p className="text-[10px]">Configura il tuo kit per popolare questa sezione.</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest Achievements Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Latest Achievements</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="achievements-shelf">
          {achievementsData.map((ach) => {
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                  ach.unlocked
                    ? 'bg-indigo-950/15 border-indigo-500/20 text-white'
                    : 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
                  ach.unlocked 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                    : 'bg-slate-900 border-slate-850 text-slate-600'
                }`}>
                  {ach.unlocked ? (
                    <Sparkles className="w-6 h-6" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white leading-tight flex items-center gap-1.5">
                    <span>{ach.title}</span>
                    {ach.unlocked && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
