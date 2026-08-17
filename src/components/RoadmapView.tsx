import React from 'react';
import { Lightbulb, Volume2, ShieldCheck, Database, Wrench, Lock, Check, ChevronRight, Play } from 'lucide-react';
import { Unit, Lesson } from '../data/curriculumData';

interface RoadmapViewProps {
  units: Unit[];
  completedLessons: string[];
  activeLessonId: string;
  onSelectLesson: (lesson: Lesson) => void;
  openSetupLab: () => void;
  simulatorActive: boolean;
  setSimulatorActive: (active: boolean) => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  units,
  completedLessons,
  activeLessonId,
  onSelectLesson,
  openSetupLab,
  simulatorActive,
  setSimulatorActive,
}) => {
  // We want to combine all lessons from all units into a flat progression roadmap
  const allLessons = units.flatMap((u) => u.lessons);

  // Helper to determine icon based on lesson type
  const getIcon = (type: string) => {
    switch (type) {
      case 'led':
        return Lightbulb;
      case 'buzzer':
        return Volume2;
      default:
        return Lightbulb;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8 pb-24" id="roadmap-container">
      {/* Upper Progress Banner */}
      <div className="bg-[#121c35] border border-slate-800/80 rounded-2xl p-6 md:p-8 mb-12 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Raphael Kit Path</h2>
            <p className="text-sm text-slate-400">Mastering Raspberry Pi modules with Python.</p>
            
            {/* Custom progress bar */}
            <div className="w-64 pt-3">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(completedLessons.length / (allLessons.length + 3)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Simulator toggle badge */}
            <button
              onClick={() => setSimulatorActive(!simulatorActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider border uppercase transition-all duration-300 ${
                simulatorActive 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400'
              }`}
              id="btn-toggle-simulator"
            >
              <div className={`w-2 h-2 rounded-full ${simulatorActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>SIMULATOR MODE: {simulatorActive ? 'ACTIVE' : 'OFFLINE'}</span>
            </button>
          </div>
        </div>

        {/* Backdrop visual glow */}
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      {/* Alternating roadmap nodes list */}
      <div className="relative flex flex-col items-center gap-12" id="roadmap-path">
        {/* Wavy line underneath */}
        <div className="absolute top-8 bottom-8 w-1 bg-slate-800/50 z-0" />

        {/* Map lessons */}
        {allLessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = lesson.id === activeLessonId;
          const isLocked = !isCompleted && !isCurrent && completedLessons.length < index;

          const IconComponent = getIcon(lesson.icon);

          // Alternating offsets
          // Even indexes centered, odd index 1 right, odd index 2 left, etc.
          let alignmentClass = 'md:translate-x-0';
          if (index % 3 === 1) {
            alignmentClass = 'md:translate-x-24';
          } else if (index % 3 === 2) {
            alignmentClass = 'md:translate-x-[-96px]';
          }

          return (
            <div
              key={lesson.id}
              className={`relative z-10 flex flex-col items-center transition-all duration-300 ${alignmentClass}`}
              id={`roadmap-node-${lesson.id}`}
            >
              {/* Active node glow indicator */}
              {isCurrent && (
                <div className="absolute -inset-4 bg-orange-500/10 rounded-full blur-xl animate-pulse" />
              )}

              {/* Node Button */}
              <button
                disabled={isLocked}
                onClick={() => onSelectLesson(lesson)}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-500 hover:scale-105 active:scale-95 ${
                  isCompleted
                    ? 'bg-orange-500 border-orange-400 text-white hover:bg-orange-600'
                    : isCurrent
                    ? 'bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-500/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <IconComponent className="w-8 h-8" />

                {/* Status Badges */}
                {isCompleted && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-[#0b1329] rounded-full p-1 shadow-lg">
                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  </div>
                )}
                {isLocked && (
                  <div className="absolute -bottom-1 -right-1 bg-slate-900 border-2 border-slate-800 rounded-full p-1.5 shadow-lg">
                    <Lock className="w-3 h-3 text-slate-500" />
                  </div>
                )}
              </button>

              {/* Lesson Text Label */}
              <div className="mt-3 text-center">
                <p className="text-xs font-extrabold text-orange-400/80 tracking-widest uppercase">{lesson.subtitle}</p>
                <h4 className="text-sm font-bold text-white mt-0.5">{lesson.title}</h4>
                
                {isCurrent && (
                  <button
                    onClick={() => onSelectLesson(lesson)}
                    className="mt-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-extrabold tracking-wider px-4 py-1.5 rounded-full uppercase flex items-center gap-1 mx-auto transition-all duration-300 shadow-md shadow-indigo-500/20"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Inizia Lezione</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add standard Raspberry Pi mock locked nodes for the complete Roadmap experience shown in Image 4 */}
        {[
          { title: 'LCD1602', sub: 'Lezione 05', label: 'LCD1602' },
          { title: 'DHT11', sub: 'Lezione 06', label: 'DHT11' },
          { title: 'Sensore Ultrasuoni', sub: 'Lezione 07', label: 'ECHO_LOC' },
          { title: 'Servo Motore', sub: 'Lezione 08', label: 'SERVO' },
          { title: 'Modulo RFID', sub: 'Lezione 09', label: 'RFID' },
          { title: 'Modulo Fotocamera', sub: 'Lezione 10', label: 'CAMERA' },
        ].map((mock, idx) => {
          const index = allLessons.length + idx;
          let alignmentClass = 'md:translate-x-0';
          if (index % 3 === 1) {
            alignmentClass = 'md:translate-x-24';
          } else if (index % 3 === 2) {
            alignmentClass = 'md:translate-x-[-96px]';
          }

          return (
            <div
              key={mock.title}
              className={`relative z-10 flex flex-col items-center opacity-40 ${alignmentClass}`}
            >
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center border-4 bg-slate-800/80 border-slate-700 text-slate-500">
                <Lock className="w-7 h-7" />
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">{mock.sub}</p>
                <h4 className="text-sm font-bold text-slate-400 mt-0.5">{mock.title}</h4>
              </div>
            </div>
          );
        })}

        {/* Final Trophy Node */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/10 flex flex-col items-center justify-center text-slate-500">
            <Lock className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Final Project</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Peach color with Wrench/Hammer) */}
      <button
        onClick={openSetupLab}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-peach-500 hover:bg-orange-400 text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-40 bg-[#fbcfe8] text-slate-900"
        title="Configura il tuo Lab"
        id="btn-floating-lab-setup"
      >
        <Wrench className="w-6 h-6 text-[#1e1b4b]" />
      </button>
    </div>
  );
};
