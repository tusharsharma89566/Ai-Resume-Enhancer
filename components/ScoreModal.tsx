
import React from 'react';
import type { AtsResult } from '../types';

interface ScoreModalProps {
  result: AtsResult | null;
  onClose: () => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ result, onClose }) => {
  if (!result) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative transform transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">ATS Score Analysis</h2>

        <div className="flex items-center justify-center gap-6 mb-6">
            <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" className="text-slate-200" fill="transparent" />
                    <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 54}
                        strokeDashoffset={(2 * Math.PI * 54) * (1 - result.score / 100)}
                        className={`${getScoreColor(result.score)} transition-all duration-1000 ease-out`}
                        fill="transparent"
                        strokeLinecap="round"
                    />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}
                </span>
            </div>
        </div>

        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-slate-700">Strengths</h3>
                <p className="text-sm text-slate-600 mt-1">{result.strengths}</p>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700">Suggestions for Improvement</h3>
                <ul className="list-disc list-inside mt-1 space-y-1">
                    {result.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-slate-600">{suggestion}</li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;
