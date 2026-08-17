import React, { useState, useEffect } from 'react';
import { ChevronLeft, Play, AlertCircle, RefreshCw, Terminal, MessageSquare, Sparkles, Search, Brain, ExternalLink, Volume2 } from 'lucide-react';
import { Lesson } from '../data/curriculumData';

interface LessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
  xp: number;
  setXp: React.Dispatch<React.SetStateAction<number>>;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  onBack,
  onComplete,
  xp,
  setXp,
}) => {
  const [code, setCode] = useState(lesson.defaultCode);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSimulatedActive, setIsSimulatedActive] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);

  // Gemini AI Tutor state
  const [aiQuery, setAiQuery] = useState('');
  const [aiMode, setAiMode] = useState<'fast' | 'thinking' | 'grounding'>('fast');
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'ai'; text: string; sources?: any[] }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Reset code when lesson changes
  useEffect(() => {
    setCode(lesson.defaultCode);
    setTerminalOutput([]);
    setIsSimulatedActive(false);
  }, [lesson]);

  const handleRunSimulation = async () => {
    setIsRunning(true);
    setTerminalOutput(prev => [...prev, `$ python3 main.py`]);

    try {
      const response = await fetch('/api/sim/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, pin: lesson.pin })
      });

      const data = await response.json();

      if (data.success) {
        // Print output lines with a small delay for typing effect
        let index = 0;
        const printInterval = setInterval(() => {
          if (index < data.outputs.length) {
            setTerminalOutput(prev => [...prev, data.outputs[index]]);
            index++;
          } else {
            clearInterval(printInterval);
            setIsRunning(false);
            // Trigger visual simulator highlight
            if (data.isLedTriggered || data.isBuzzerTriggered || data.outputs.some((o: string) => o.includes("acceso") || o.includes("buzzer"))) {
              setIsSimulatedActive(true);
            }
            // Reward some XP if not completed yet
            setXp(prev => prev + 25);
          }
        }, 600);
      } else {
        setTerminalOutput(prev => [...prev, `Errore: ${data.error}`]);
        setIsRunning(false);
      }
    } catch (err: any) {
      setTerminalOutput(prev => [...prev, `Errore di connessione: ${err.message}`]);
      setIsRunning(false);
    }
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    const userMsg = aiQuery;
    setAiChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiQuery('');
    setAiLoading(true);

    try {
      // Add current code context to helper
      const fullPrompt = `Sei l'Assistente virtuale PyCircuit. Aiuta lo studente con la lezione "${lesson.title}".
Codice attuale della lezione:
\`\`\`python
${code}
\`\`\`

Domanda dello studente:
${userMsg}`;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, mode: aiMode })
      });

      const data = await response.json();

      if (data.error) {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: `Impossibile completare la richiesta: ${data.error}` }]);
      } else {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: data.text, sources: data.groundingSources }]);
      }
    } catch (err: any) {
      setAiChatHistory(prev => [...prev, { role: 'ai', text: `Errore di rete: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8" id="lesson-view-container">
      {/* HEADER CONTROLS */}
      <div className="col-span-12 flex items-center justify-between border-b border-slate-800 pb-4 mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all bg-slate-800/40 hover:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-800"
          id="btn-back-to-roadmap"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Indietro</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-indigo-400 bg-indigo-900/40 border border-indigo-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            {lesson.difficulty}
          </span>
          <button
            onClick={onComplete}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02]"
            id="btn-complete-lesson"
          >
            Sblocca Quiz
          </button>
        </div>
      </div>

      {/* LEFT COLUMN: DESCRIPTION AND VISUAL BOARD SIMULATOR (6 cols on Desktop) */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-green-400 tracking-widest uppercase block" id="lesson-module-tag">
              {lesson.module} • {lesson.subtitle}
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight" id="lesson-title">
              {lesson.title}
            </h1>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed" id="lesson-description">
            {lesson.description}
          </p>
        </div>

        {/* INTERACTIVE BOARD SIMULATOR SVG */}
        <div className="bg-[#121c35] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl aspect-video flex flex-col items-center justify-center min-h-[250px]" id="hardware-visual-simulator">
          {/* Breadboard & Raspberry Pi custom schematic */}
          <div className="absolute inset-0 bg-slate-950/20" />
          
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-4">
            {/* Real schematic rendering */}
            <div className="flex items-center gap-12">
              {/* Raspberry Pi representation */}
              <div className="w-28 h-36 bg-emerald-800 border-2 border-emerald-600 rounded-xl p-3 flex flex-col justify-between relative shadow-lg">
                <div className="text-[10px] font-black text-emerald-300 tracking-tight uppercase">Raspberry Pi</div>
                
                {/* GPIO Header block */}
                <div className="absolute right-1 top-4 bottom-4 w-4 bg-slate-900 border border-slate-700 rounded flex flex-col gap-0.5 p-0.5 justify-around">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-sm ${i === 4 ? 'bg-orange-500' : i === 7 ? 'bg-blue-500' : 'bg-slate-700'}`} 
                    />
                  ))}
                </div>

                <div className="w-6 h-6 rounded bg-slate-900/60 border border-slate-700 text-[8px] font-bold text-center flex items-center justify-center text-slate-400">BCM</div>
              </div>

              {/* Jumper Cable Line */}
              <div className="relative w-16 h-1 bg-transparent">
                <svg className="absolute -top-12 left-0 w-16 h-24 overflow-visible">
                  <path 
                    d="M 0,50 Q 30,-20 64,20" 
                    fill="none" 
                    stroke={lesson.icon === 'led' ? '#f97316' : '#3b82f6'} 
                    strokeWidth="3" 
                    className={`stroke-dasharray-5 ${isSimulatedActive ? 'animate-pulse' : ''}`}
                  />
                  <path 
                    d="M 0,70 Q 30,100 64,50" 
                    fill="none" 
                    stroke="#475569" 
                    strokeWidth="2" 
                  />
                </svg>
              </div>

              {/* Component breadboard Representation */}
              <div className="w-28 h-36 bg-[#0f172a] border border-slate-800 rounded-xl flex flex-col items-center justify-center p-3 relative shadow-lg">
                <div className="text-[9px] font-bold text-slate-500 mb-4 uppercase">Breadboard</div>

                {lesson.icon === 'led' ? (
                  <div className="relative flex flex-col items-center">
                    {/* Led Component */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${
                      isSimulatedActive 
                        ? 'bg-red-500 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse' 
                        : 'bg-red-950/40 border-red-800 text-red-500/30'
                    }`}>
                      <span className="text-[8px] font-bold">LED</span>
                    </div>
                    {isSimulatedActive && (
                      <span className="text-[10px] font-bold text-red-400 mt-2 tracking-wider uppercase animate-bounce">ACCESO!</span>
                    )}
                  </div>
                ) : (
                  <div className="relative flex flex-col items-center">
                    {/* Buzzer Component */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isSimulatedActive 
                        ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                        : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}>
                      <Volume2 className={`w-6 h-6 ${isSimulatedActive ? 'text-orange-500 animate-bounce' : 'text-slate-600'}`} />
                    </div>

                    {isSimulatedActive && (
                      <div className="absolute -inset-4 border-2 border-orange-500/30 rounded-full animate-ping pointer-events-none" />
                    )}

                    {isSimulatedActive && (
                      <span className="text-[10px] font-bold text-orange-400 mt-2 tracking-wider uppercase">BZZZZZ!</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-500">
            PIN: {lesson.pin} | MODALITÀ SIMULATORE
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: CODE EDITOR & GEMINI CO-PILOT (7 cols on Desktop) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Code Editor Frame */}
        <div className="bg-[#0a1122] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl" id="python-code-editor">
          {/* Editor Header */}
          <div className="bg-[#121c35] px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-slate-300 font-mono">main.py</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE EDITOR
              </span>

              {/* Red-Yellow-Green buttons */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

          {/* Actual Code Area */}
          <div className="flex font-mono text-xs text-slate-300 relative">
            {/* Line numbers bar */}
            <div className="bg-[#121c35]/40 select-none text-right px-3 py-4 text-slate-600 border-r border-slate-800/40 select-none flex flex-col gap-1 w-10">
              {code.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Editable code text-area */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#070d19] p-4 text-slate-100 font-mono text-xs focus:outline-none resize-none min-h-[180px] md:min-h-[220px] leading-relaxed"
              spellCheck="false"
              id="editor-textarea"
            />
          </div>

          {/* Terminal output console */}
          {showTerminal && (
            <div className="bg-[#050912] border-t border-slate-800/80 p-4 font-mono text-xs" id="editor-terminal-output">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-wider mb-2 select-none">
                <span>Terminal Output</span>
                <button 
                  onClick={() => setTerminalOutput([])}
                  className="hover:text-slate-300 text-slate-600 flex items-center gap-1 transition"
                  id="btn-clear-terminal"
                >
                  <RefreshCw className="w-3 h-3" /> Pulisci
                </button>
              </div>

              <div className="space-y-1 min-h-[80px] max-h-[140px] overflow-y-auto text-slate-300 select-all">
                {terminalOutput.length === 0 ? (
                  <span className="text-slate-600">Nessun output registrato. Fai clic su "Esegui & Simula" per avviare il codice.</span>
                ) : (
                  terminalOutput.map((out, i) => (
                    <div key={i} className={out.startsWith('$') ? 'text-indigo-400 font-bold' : out.includes('Errore') ? 'text-red-400' : 'text-emerald-400'}>
                      {out}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Editor Action Buttons */}
          <div className="bg-[#121c35]/40 px-4 py-3 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              PROCESSORE: VIRTUAL BCM2835 | FREQUENZA: 1.2GHZ
            </span>

            <button
              disabled={isRunning}
              onClick={handleRunSimulation}
              className={`flex items-center gap-2 font-bold px-6 py-2.5 rounded-xl text-white text-xs shadow-lg transition-all duration-300 ${
                isRunning
                  ? 'bg-slate-700 border border-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-[#f97316] hover:bg-[#ea580c] shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95'
              }`}
              id="btn-run-simulation"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isRunning ? 'Esecuzione...' : '⚡ Esegui & Simula'}</span>
            </button>
          </div>
        </div>

        {/* GEMINI INTEGRATED COPILOT / CHAT HELP */}
        <div className="bg-[#0a1122] border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl" id="gemini-tutor-assistant">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-sm font-extrabold text-white">Assistente AI PyCircuit</h3>
            </div>

            {/* Mode selection for user instructions */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setAiMode('fast')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                  aiMode === 'fast' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Risposta Rapida (Gemini 3.1 Flash-Lite)"
              >
                Lite
              </button>
              <button
                type="button"
                onClick={() => setAiMode('thinking')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                  aiMode === 'thinking' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Ragionamento Profondo (Gemini 3.1 Pro Preview)"
              >
                <Brain className="w-3 h-3" /> Thinking
              </button>
              <button
                type="button"
                onClick={() => setAiMode('grounding')}
                className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
                  aiMode === 'grounding' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grounding con Google Search"
              >
                <Search className="w-3 h-3" /> Search
              </button>
            </div>
          </div>

          {/* Chat message threads */}
          <div className="space-y-4 max-h-[220px] overflow-y-auto mb-4 p-2 rounded-xl bg-slate-950/40 border border-slate-900 leading-relaxed font-sans text-xs">
            {aiChatHistory.length === 0 ? (
              <p className="text-slate-500 text-center py-4">
                Hai dubbi sui pin del Raspberry Pi o errori di sintassi? Chiedi a Gemini!
              </p>
            ) : (
              aiChatHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                    {msg.role === 'user' ? 'Tu' : 'PyCircuit AI Partner'}
                  </span>
                  <div className={`p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-800'
                  }`}>
                    {msg.text}

                    {/* Show Google Search Grounding metadata if relevant */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/50">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1 flex items-center gap-1">
                          <Search className="w-3 h-3 text-emerald-400" /> Fonti Grounding Google Search:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, index) => (
                            <a
                              key={index}
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] bg-slate-900 border border-slate-700 text-emerald-400 hover:text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 transition"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {aiLoading && (
              <div className="flex items-center gap-2 text-slate-400 py-2">
                <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
                <span className="animate-pulse">Analisi e generazione risposta in corso...</span>
              </div>
            )}
          </div>

          {/* Prompt input field */}
          <form onSubmit={handleAskGemini} className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={
                aiMode === 'thinking' 
                  ? 'Fai una domanda complessa (es. "ottimizza questa temporizzazione")' 
                  : aiMode === 'grounding'
                  ? 'Cerca schemi di pin reali (es. "pinout i2c raspberry pi 5")'
                  : 'Fai una domanda rapida sull\'elettronica...'
              }
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              id="gemini-input-query"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
              id="btn-gemini-submit"
            >
              <span>Chiedi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
