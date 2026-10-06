import React, { useState, useEffect } from 'react';
import { Assessment, Attempt, Question } from '../../types';
import { assessmentRepository } from '../../repositories';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/translations';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RotateCcw, 
  ArrowRight, 
  HelpCircle,
  Clock
} from 'lucide-react';

interface InteractiveQuizProps {
  assessmentId: string;
  onAssessmentPassed?: (score: number) => void;
  onClose?: () => void;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  assessmentId,
  onAssessmentPassed,
  onClose
}) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<Attempt | null>(null);
  const [isQuizActive, setIsQuizActive] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await assessmentRepository.getAssessmentById(assessmentId);
      setAssessment(data);
      if (data) {
        const past = await assessmentRepository.getAttempts(currentUser.id, assessmentId);
        setAttempts(past);
        if (past.length > 0) {
          setLatestAttempt(past[past.length - 1]);
        }
      }
    }
    loadData();
  }, [assessmentId, currentUser.id]);

  if (!assessment) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Loading assessment...
      </div>
    );
  }

  const handleSelectOption = (question: Question, optionId: string) => {
    if (question.type === 'multiple-select') {
      const existing = (currentAnswers[question.id] as string[]) || [];
      const updated = existing.includes(optionId)
        ? existing.filter((id) => id !== optionId)
        : [...existing, optionId];
      setCurrentAnswers({ ...currentAnswers, [question.id]: updated });
    } else {
      setCurrentAnswers({ ...currentAnswers, [question.id]: optionId });
    }
  };

  const calculateScore = (): { scorePercent: number; totalEarned: number; totalPossible: number } => {
    let earnedPoints = 0;
    let totalPoints = 0;

    assessment.questions.forEach((q) => {
      totalPoints += q.points;
      const userAns = currentAnswers[q.id];

      if (q.type === 'multiple-select') {
        const userArr = (userAns as string[]) || [];
        const isMatch = 
          userArr.length === q.correctAnswers.length &&
          userArr.every((id) => q.correctAnswers.includes(id));
        if (isMatch) earnedPoints += q.points;
      } else {
        if (userAns && q.correctAnswers.includes(userAns as string)) {
          earnedPoints += q.points;
        }
      }
    });

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    return { scorePercent, totalEarned: earnedPoints, totalPossible: totalPoints };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { scorePercent } = calculateScore();
    const passed = scorePercent >= assessment.passingScore;

    const newAttempt: Attempt = {
      id: `attempt-${Date.now()}`,
      userId: currentUser.id,
      assessmentId: assessment.id,
      score: scorePercent,
      passed,
      attemptNumber: attempts.length + 1,
      answers: currentAnswers,
      submittedAt: new Date().toISOString()
    };

    await assessmentRepository.saveAttempt(newAttempt);
    setAttempts([...attempts, newAttempt]);
    setLatestAttempt(newAttempt);
    setIsQuizActive(false);
    setIsSubmitting(false);

    if (passed && onAssessmentPassed) {
      onAssessmentPassed(scorePercent);
    }
  };

  const canAttemptAgain = assessment.maxAttempts === 0 || attempts.length < assessment.maxAttempts;

  // View: Not started or showing previous results
  if (!isQuizActive && latestAttempt) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            latestAttempt.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
              Attempt #{latestAttempt.attemptNumber}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{assessment.title}</h3>
            <p className="text-xs text-slate-500">{assessment.description}</p>
          </div>

          {/* Big Score indicator */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-block min-w-[200px]">
            <div className="text-xs text-slate-500 font-medium">Your Score</div>
            <div className={`text-4xl font-extrabold font-mono mt-1 ${
              latestAttempt.passed ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              {latestAttempt.score}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Passing threshold: {assessment.passingScore}%
            </div>
          </div>

          <div className={`text-xs font-semibold py-2 px-4 rounded-lg inline-block ${
            latestAttempt.passed ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
          }`}>
            {latestAttempt.passed ? '✓ Passing score achieved. Lesson completed.' : '✕ Threshold not reached. Review lesson and retake.'}
          </div>
        </div>

        {/* Detailed Question Review if revealAnswers is enabled */}
        {assessment.revealAnswers && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Evaluation Feedback Breakdown
            </h4>

            <div className="space-y-3">
              {assessment.questions.map((q, idx) => {
                const userAns = latestAttempt.answers[q.id];
                const isCorrect = q.type === 'multiple-select'
                  ? ((userAns as string[]) || []).length === q.correctAnswers.length &&
                    ((userAns as string[]) || []).every((id) => q.correctAnswers.includes(id))
                  : userAns && q.correctAnswers.includes(userAns as string);

                return (
                  <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {idx + 1}. {q.question}
                      </span>
                      <span className={`shrink-0 font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorrect ? `+${q.points} pts` : '0 pts'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="font-semibold block text-slate-700">Correct Federation Answer:</span>
                      {q.options
                        .filter((opt) => q.correctAnswers.includes(opt.id))
                        .map((opt) => opt.text)
                        .join(', ')}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 italic">
                        "{q.explanation}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-400 font-mono">
            Attempts: {attempts.length} {assessment.maxAttempts > 0 && `/${assessment.maxAttempts}`}
          </div>

          <div className="flex items-center gap-2">
            {canAttemptAgain && (
              <button
                onClick={() => {
                  setCurrentAnswers({});
                  setIsQuizActive(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Assessment</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Continue Course →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Assessment in progress
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-xs uppercase text-blue-700 font-bold">
            Formal Assessment Test
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{assessment.title}</h3>
          <p className="text-xs text-slate-500">{assessment.description}</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Passing: <strong>{assessment.passingScore}%</strong>
          </div>
          <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            Questions: <strong>{assessment.questions.length}</strong>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {assessment.questions.map((q, idx) => {
          const selected = currentAnswers[q.id];

          return (
            <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex items-start justify-between gap-3 text-xs">
                <div className="font-bold text-slate-900 text-sm">
                  {idx + 1}. {q.question}
                </div>
                <span className="font-mono text-[11px] text-slate-500 shrink-0">
                  {q.points} pts
                </span>
              </div>

              {q.type === 'multiple-select' && (
                <span className="text-[11px] text-blue-600 font-medium block">
                  (Select all options that apply)
                </span>
              )}

              <div className="space-y-2">
                {q.options.map((opt) => {
                  const isChecked = q.type === 'multiple-select'
                    ? ((selected as string[]) || []).includes(opt.id)
                    : selected === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(q, opt.id)}
                      className={`w-full p-3 text-left text-xs rounded-xl border transition-all flex items-center gap-3 ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold shadow-2xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center border font-mono text-[10px] ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked ? '✓' : ''}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={() => setIsQuizActive(false)}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          Cancel
        </button>

        <button
          disabled={isSubmitting || Object.keys(currentAnswers).length === 0}
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 shadow-sm transition-all flex items-center gap-2"
        >
          <span>{isSubmitting ? 'Evaluating...' : 'Submit Answers'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
