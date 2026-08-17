import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Quiz, Option } from '../data/curriculumData';

interface QuizViewProps {
  quiz: Quiz;
  onCorrectAnswer: () => void;
  onClose: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ quiz, onCorrectAnswer, onClose }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId) return;
    setHasSubmitted(true);
  };

  const isCorrect = selectedOptionId ? quiz.options.find(o => o.id === selectedOptionId)?.isCorrect : false;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-24" id="quiz-container">
      {/* Quiz Progress header */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-8">
        <div className="bg-orange-500 h-full w-2/3" />
      </div>

      <div className="bg-[#0a1122] border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6" id="quiz-card">
        {/* Module Header Badge */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-orange-400" />
            <span>MODULO 2: HARDWARE INTERFACE</span>
          </div>
        </div>

        {/* Question Title */}
        <h2 className="text-xl md:text-2xl font-extrabold text-white text-center leading-snug">
          {quiz.question}
        </h2>

        {/* Answer Options */}
        <div className="grid grid-cols-1 gap-3.5 pt-4">
          {quiz.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            
            let btnClass = 'bg-[#121c35]/40 border-slate-800 hover:border-slate-700 hover:bg-[#121c35]/70 text-slate-300';
            let circleClass = 'bg-slate-900 text-slate-400 border-slate-800';

            if (isSelected && !hasSubmitted) {
              btnClass = 'bg-orange-500/10 border-orange-500 text-orange-400';
              circleClass = 'bg-orange-500 text-white border-orange-400';
            }

            if (hasSubmitted) {
              if (option.isCorrect) {
                // Correct choice styling
                btnClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
                circleClass = 'bg-emerald-500 text-white border-emerald-400';
              } else if (isSelected && !option.isCorrect) {
                // Wrong choice styling
                btnClass = 'bg-rose-500/10 border-rose-500 text-rose-400';
                circleClass = 'bg-rose-500 text-white border-rose-400';
              } else {
                // Non-selected wrong choices
                btnClass = 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60';
                circleClass = 'bg-slate-950 text-slate-700 border-slate-900';
              }
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={hasSubmitted}
                className={`w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all duration-300 ${btnClass}`}
                id={`quiz-option-${option.id}`}
              >
                <div className="flex items-center gap-4">
                  {/* Circle ID identifier (A, B, C, D) */}
                  <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm border transition-all ${circleClass}`}>
                    {option.id}
                  </div>
                  
                  {/* Code / Text answer content */}
                  <span className="font-mono text-xs md:text-sm">{option.text}</span>
                </div>

                {/* Trailing check/cross indicators */}
                {hasSubmitted && option.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                )}
                {hasSubmitted && isSelected && !option.isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* FEEDBACK EXPLANATION BANNER */}
        {hasSubmitted && (
          <div className={`p-4 rounded-2xl flex gap-3 leading-relaxed text-xs border ${
            isCorrect 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`} id="quiz-feedback-banner">
            <div>
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
            </div>
            <div>
              <p className="font-extrabold uppercase text-[10px] tracking-wider mb-1">
                {isCorrect ? 'Ottimo lavoro!' : 'Riprova! Spiegazione:'}
              </p>
              <p className="font-medium text-slate-300">{quiz.explanation}</p>
            </div>
          </div>
        )}

        {/* SUBMIT OR CONTINUE ACTION BUTTONS */}
        <div className="pt-4 flex justify-end">
          {!hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOptionId}
              className={`w-full font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 ${
                selectedOptionId
                  ? 'bg-[#f97316] hover:bg-[#ea580c] text-white shadow-lg shadow-orange-500/10'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              id="btn-quiz-verify"
            >
              Verifica Risposta
            </button>
          ) : (
            <button
              onClick={isCorrect ? onCorrectAnswer : onClose}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3.5 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all"
              id="btn-quiz-continue"
            >
              <span>Continua</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
