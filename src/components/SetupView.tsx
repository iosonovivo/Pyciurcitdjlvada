import React, { useState } from 'react';
import { Box, Code, Cpu, Check, Laptop, Shield, Sparkles } from 'lucide-react';
import { HardwareComponent, componentsData } from '../data/curriculumData';

interface SetupViewProps {
  onClose: () => void;
  simulatorActive: boolean;
  setSimulatorActive: (active: boolean) => void;
  userComponents: HardwareComponent[];
  setUserComponents: (components: HardwareComponent[]) => void;
}

// All available default pieces to check/uncheck
const ALL_AVAILABLE_PIECES: Omit<HardwareComponent, 'status'>[] = [
  { id: 'comp-1', name: 'LED Module', type: 'Actuator', icon: 'led' },
  { id: 'comp-2', name: 'PIR Sensor', type: 'Input Device', icon: 'eye' },
  { id: 'comp-3', name: 'Servo Motor', type: 'Mechanical', icon: 'settings' },
  { id: 'comp-4', name: 'DHT11 Sensor', type: 'Temp/Humidity', icon: 'thermometer' },
  { id: 'comp-buzzer', name: 'Active Buzzer', type: 'Actuator', icon: 'bell' },
  { id: 'comp-ultrasonic', name: 'Ultrasonic Sensor', type: 'Sensor', icon: 'eye' },
  { id: 'comp-lcd', name: 'LCD 1602 Display', type: 'Actuator', icon: 'cpu' },
  { id: 'comp-rfid', name: 'RFID RC522 Reader', type: 'Input Device', icon: 'cpu' }
];

export const SetupView: React.FC<SetupViewProps> = ({ 
  onClose, 
  simulatorActive, 
  setSimulatorActive,
  userComponents,
  setUserComponents
}) => {
  const [hasKit, setHasKit] = useState<boolean>(!simulatorActive);
  const [piModel, setPiModel] = useState<'Pi4' | 'Pi5'>('Pi4');
  const [selectedKitPreset, setSelectedKitPreset] = useState<'raphael' | 'starter' | 'custom'>('raphael');
  
  // Track manually checked pieces
  const [selectedPieces, setSelectedPieces] = useState<string[]>(
    userComponents.map(c => c.id)
  );

  const handlePresetChange = (preset: 'raphael' | 'starter' | 'custom') => {
    setSelectedKitPreset(preset);
    if (preset === 'raphael') {
      // Raphael kit has all components
      setSelectedPieces(ALL_AVAILABLE_PIECES.map(p => p.id));
    } else if (preset === 'starter') {
      // Starter kit has LED and DHT11 and Buzzer
      setSelectedPieces(['comp-1', 'comp-4', 'comp-buzzer']);
    } else {
      // Custom starts empty or with current ones
      setSelectedPieces([]);
    }
  };

  const handleTogglePiece = (id: string) => {
    setSelectedKitPreset('custom'); // Any manual change switches preset to custom
    if (selectedPieces.includes(id)) {
      setSelectedPieces(selectedPieces.filter(pId => pId !== id));
    } else {
      setSelectedPieces([...selectedPieces, id]);
    }
  };

  const handleStartAdventure = () => {
    setSimulatorActive(!hasKit);
    
    // Save chosen components to active inventory
    if (hasKit) {
      const activeComponents: HardwareComponent[] = ALL_AVAILABLE_PIECES
        .filter(p => selectedPieces.includes(p.id))
        .map(p => ({
          ...p,
          status: 'active'
        }));
      setUserComponents(activeComponents);
    } else {
      // Simulation mode: give default active components
      setUserComponents(
        componentsData.map(c => ({ ...c, status: 'active' }))
      );
    }
    
    onClose();
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-24" id="setup-lab-container">
      <div className="bg-[#0a1122] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8" id="setup-lab-card">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 mb-2">
            <Laptop className="w-6 h-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Configura il tuo Lab</h2>
          <p className="text-sm text-slate-400">
            Sincronizziamo il software con il tuo hardware per iniziare a programmare.
          </p>
        </div>

        {/* Step 1: Mode Selection */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-orange-400 tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span>1. Scegli la Modalità</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simulator Mode */}
            <button
              type="button"
              onClick={() => setHasKit(false)}
              className={`text-left p-5 rounded-2xl border-2 flex flex-col justify-between h-40 transition-all duration-300 ${
                !hasKit
                  ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-[#121c35]/30 border-slate-900 hover:border-slate-800 hover:bg-[#121c35]/50 text-slate-400'
              }`}
              id="btn-select-simulator-mode"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                !hasKit ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <Code className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-white">Modalità Simulazione</p>
                <p className="text-xs text-slate-400 mt-1">Nessun hardware richiesto. Simula breadboard e LED in tempo reale.</p>
              </div>
            </button>

            {/* Physical Kit Mode */}
            <button
              type="button"
              onClick={() => {
                setHasKit(true);
                // Set default to Raphael preset on click if not already
                if (selectedPieces.length === 0) {
                  setSelectedPieces(ALL_AVAILABLE_PIECES.map(p => p.id));
                }
              }}
              className={`text-left p-5 rounded-2xl border-2 flex flex-col justify-between h-40 transition-all duration-300 ${
                hasKit
                  ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-[#121c35]/30 border-slate-900 hover:border-slate-800 hover:bg-[#121c35]/50 text-slate-400'
              }`}
              id="btn-select-physical-kit"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                hasKit ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}>
                <Box className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-white">Possiedo un Kit Fisico</p>
                <p className="text-xs text-slate-400 mt-1">Collega sensori reali e attuatori alla tua scheda Raspberry Pi.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Physical Kit Customization (Only if Physical Kit chosen) */}
        {hasKit && (
          <div className="space-y-5 border-t border-slate-850 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-orange-400 tracking-wider uppercase flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                <span>2. Gestione Componenti Kit</span>
              </h3>
              <span className="text-[10px] bg-slate-900 text-slate-400 px-2.5 py-1 rounded-full font-bold border border-slate-800">
                {selectedPieces.length} Pezzi Selezionati
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handlePresetChange('raphael')}
                className={`py-2.5 rounded-xl border text-center text-xs font-bold transition ${
                  selectedKitPreset === 'raphael'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                Kit Raphael
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('starter')}
                className={`py-2.5 rounded-xl border text-center text-xs font-bold transition ${
                  selectedKitPreset === 'starter'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                Starter Kit Base
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('custom')}
                className={`py-2.5 rounded-xl border text-center text-xs font-bold transition ${
                  selectedKitPreset === 'custom'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                Manuale
              </button>
            </div>

            {/* Piece Checklist Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-900 max-h-56 overflow-y-auto" id="kit-pieces-checklist">
              {ALL_AVAILABLE_PIECES.map((piece) => {
                const isChecked = selectedPieces.includes(piece.id);
                return (
                  <button
                    type="button"
                    key={piece.id}
                    onClick={() => handleTogglePiece(piece.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-left transition ${
                      isChecked
                        ? 'bg-[#121c35]/50 border-indigo-500/50 text-white'
                        : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold leading-none">{piece.name}</p>
                      <p className="text-[9px] text-slate-500">{piece.type}</p>
                    </div>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-all ${
                      isChecked ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-800 text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Raspberry Pi Model Selector */}
        <div className="space-y-4 border-t border-slate-850 pt-6">
          <h3 className="text-xs font-black text-orange-400 tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span>{hasKit ? '3. Modello Raspberry Pi' : '2. Modello Raspberry Pi'}</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-3" id="pi-model-grid">
            <button
              onClick={() => setPiModel('Pi4')}
              className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                piModel === 'Pi4'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              id="btn-select-pi4"
            >
              Raspberry Pi 4
            </button>
            <button
              onClick={() => setPiModel('Pi5')}
              className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                piModel === 'Pi5'
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              id="btn-select-pi5"
            >
              Raspberry Pi 5
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
            <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-850 overflow-hidden flex items-center justify-center shadow-inner shrink-0">
              <Cpu className={`w-8 h-8 text-indigo-400 transition-all duration-700 ${piModel === 'Pi5' ? 'rotate-90 text-amber-400' : ''}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Architettura Virtuale RPi {piModel === 'Pi4' ? '4' : '5'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {piModel === 'Pi4' ? 'Broadcom BCM2711 quad-core Cortex-A72' : 'Broadcom BCM2712 quad-core Cortex-A76 con I/O RP1'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="pt-2">
          <button
            onClick={handleStartAdventure}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-2"
            id="btn-start-adventure"
          >
            <Shield className="w-4 h-4" />
            <span>Salva e Inizia l'Avventura</span>
          </button>
        </div>
      </div>
    </div>
  );
};
