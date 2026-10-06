import React, { useState } from 'react';
import { 
  ContentBlock, 
  HeadingBlockData, 
  TextBlockData, 
  ImageBlockData, 
  VideoBlockData, 
  DocumentBlockData, 
  LinkBlockData, 
  CalloutBlockData, 
  QuestionBlockData, 
  ScenarioBlockData, 
  AssessmentBlockData, 
  AssignmentBlockData 
} from '../../types';
import { 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  ShieldAlert, 
  FileText, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Award,
  UploadCloud,
  Send
} from 'lucide-react';

interface BlockRendererProps {
  block: ContentBlock;
  onLaunchAssessment?: (assessmentId: string) => void;
  onVideoComplete?: () => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  block, 
  onLaunchAssessment,
  onVideoComplete 
}) => {
  // Question block local state
  const [selectedQuestionOption, setSelectedQuestionOption] = useState<number | null>(null);
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Scenario block local state
  const [selectedScenarioChoice, setSelectedScenarioChoice] = useState<string | null>(null);

  // Assignment submission local state
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  switch (block.type) {
    case 'heading': {
      const data = block.data as HeadingBlockData;
      if (data.level === 1) {
        return (
          <div className="border-b border-slate-200 pb-3 my-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {data.text}
            </h1>
            {data.subtitle && (
              <p className="text-sm text-slate-500 mt-1 font-medium">
                {data.subtitle}
              </p>
            )}
          </div>
        );
      }
      if (data.level === 2) {
        return (
          <div className="pt-4 pb-1">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {data.text}
            </h2>
            {data.subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {data.subtitle}
              </p>
            )}
          </div>
        );
      }
      return (
        <h3 className="text-base font-bold text-slate-800 pt-3">
          {data.text}
        </h3>
      );
    }

    case 'text': {
      const data = block.data as TextBlockData;
      // Simple parser for markdown headings, bold text, lists
      const lines = (data.content || '').split('\n');
      return (
        <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed space-y-2.5 my-2">
          {lines.map((line, idx) => {
            if (line.startsWith('### ')) {
              return <h3 key={idx} className="text-base font-bold text-slate-900 pt-2">{line.replace('### ', '')}</h3>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={idx} className="text-lg font-bold text-slate-900 pt-3">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('* ') || line.startsWith('- ')) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2 text-slate-700">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{line.replace(/^(\*|-)\s+/, '')}</span>
                </div>
              );
            }
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2 text-slate-700">
                  <span className="font-mono text-xs font-bold text-blue-600">{line.match(/^\d+\./)?.[0]}</span>
                  <span>{line.replace(/^\d+\.\s+/, '')}</span>
                </div>
              );
            }
            if (!line.trim()) return <div key={idx} className="h-1.5" />;
            return <p key={idx}>{line}</p>;
          })}
        </div>
      );
    }

    case 'image': {
      const data = block.data as ImageBlockData;
      return (
        <figure className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <img
            src={data.url || 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80'}
            alt={data.alt || 'Course illustration'}
            className="w-full max-h-96 object-cover bg-slate-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          {data.caption && (
            <figcaption className="p-2.5 text-center text-xs text-slate-500 font-medium bg-slate-50 border-t border-slate-100">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'video': {
      const data = block.data as VideoBlockData;
      return (
        <div className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm text-white">
          <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-xs">
            <span className="font-bold flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              {data.title || 'Video Instruction'}
            </span>
            {data.durationMinutes && (
              <span className="font-mono text-[11px] text-slate-400">
                {data.durationMinutes} min
              </span>
            )}
          </div>
          <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
            {data.sourceUrl && data.sourceUrl.endsWith('.mp4') ? (
              <video
                controls
                src={data.sourceUrl}
                poster={data.thumbnail}
                className="w-full h-full object-contain"
                onEnded={onVideoComplete}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div 
                  onClick={onVideoComplete}
                  className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                >
                  <Play className="w-7 h-7 text-blue-400 fill-blue-400 ml-1" />
                </div>
                <div className="text-xs text-slate-400 font-medium max-w-sm">
                  {data.title}
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                  Internal Storage Video Placeholder
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'document': {
      const data = block.data as DocumentBlockData;
      return (
        <div className="my-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                {data.title || 'Course Resource Document'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {data.format || 'PDF'} • {data.fileSize || '1.0 MB'}
              </div>
            </div>
          </div>
          <a
            href={data.fileUrl || '#'}
            onClick={(e) => { e.preventDefault(); alert(`Downloading resource: ${data.title}`); }}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
          >
            Download
          </a>
        </div>
      );
    }

    case 'link': {
      const data = block.data as LinkBlockData;
      return (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 flex items-center justify-between gap-2 text-xs text-blue-800 transition-colors block"
        >
          <div>
            <span className="font-bold flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              {data.title}
            </span>
            {data.description && <p className="text-slate-500 text-[11px] mt-0.5">{data.description}</p>}
          </div>
          <span className="font-mono text-[10px] text-blue-600 underline shrink-0">Open Link</span>
        </a>
      );
    }

    case 'callout': {
      const data = block.data as CalloutBlockData;
      const styles = {
        info: {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-900',
          icon: Info,
          iconColor: 'text-blue-600'
        },
        tip: {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-900',
          icon: Lightbulb,
          iconColor: 'text-emerald-600'
        },
        warning: {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          icon: AlertTriangle,
          iconColor: 'text-amber-600'
        },
        rule: {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-900',
          icon: ShieldAlert,
          iconColor: 'text-rose-600'
        }
      }[data.style || 'info'];

      const IconComponent = styles.icon;

      return (
        <div className={`my-4 p-4 rounded-xl border ${styles.bg} ${styles.border} ${styles.text} text-xs shadow-2xs`}>
          <div className="flex items-start gap-3">
            <IconComponent className={`w-4 h-4 ${styles.iconColor} shrink-0 mt-0.5`} />
            <div className="space-y-1">
              {data.title && <div className="font-bold text-xs uppercase tracking-wide">{data.title}</div>}
              <p className="leading-relaxed font-normal">{data.text}</p>
            </div>
          </div>
        </div>
      );
    }

    case 'question': {
      const data = block.data as QuestionBlockData;
      const isAnswered = questionSubmitted && selectedQuestionOption !== null;
      const isCorrect = selectedQuestionOption === data.correctIndex;

      return (
        <div className="my-5 p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Knowledge Check</span>
          </div>

          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {data.question}
          </p>

          <div className="space-y-2">
            {(data.options || []).map((opt, idx) => {
              const isSelected = selectedQuestionOption === idx;
              let btnClass = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

              if (isAnswered) {
                if (idx === data.correctIndex) {
                  btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'border-rose-400 bg-rose-50 text-rose-900';
                } else {
                  btnClass = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                btnClass = 'border-blue-600 bg-blue-50 text-blue-900 font-medium shadow-xs';
              }

              return (
                <button
                  key={idx}
                  disabled={questionSubmitted}
                  onClick={() => setSelectedQuestionOption(idx)}
                  className={`w-full p-3 text-left text-xs rounded-xl border transition-all flex items-center justify-between gap-3 ${btnClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono text-[10px] shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswered && idx === data.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {!questionSubmitted ? (
            <div className="pt-2 flex justify-end">
              <button
                disabled={selectedQuestionOption === null}
                onClick={() => setQuestionSubmitted(true)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors shadow-2xs"
              >
                Check Answer
              </button>
            </div>
          ) : (
            <div className={`p-3 rounded-xl text-xs space-y-1 ${
              isCorrect ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {isCorrect ? '✓ Correct Decision' : '✕ Review Recommended'}
              </div>
              {data.explanation && (
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {data.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'scenario': {
      const data = block.data as ScenarioBlockData;
      const selectedChoice = (data.choices || []).find((c) => c.id === selectedScenarioChoice);

      return (
        <div className="my-5 p-5 rounded-2xl border border-slate-300 bg-slate-50 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              On-Ice Scenario Decision
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              Interactive
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">{data.title}</h4>
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
              {data.situation}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600 block">
              Select your coaching decision:
            </span>
            {(data.choices || []).map((choice) => {
              const isSelected = selectedScenarioChoice === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => setSelectedScenarioChoice(choice.id)}
                  className={`w-full p-3 text-left text-xs rounded-xl border transition-all ${
                    isSelected
                      ? choice.isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium'
                        : 'border-rose-400 bg-rose-50 text-rose-950'
                      : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-slate-500">•</span>
                    <span>{choice.text}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedChoice && (
            <div className={`p-3.5 rounded-xl text-xs space-y-1 border ${
              selectedChoice.isCorrect 
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200' 
                : 'bg-rose-50 text-rose-950 border-rose-200'
            }`}>
              <div className="font-bold">
                {selectedChoice.isCorrect ? '✓ Approved Federation Action' : '⚠️ Sub-optimal Coaching Choice'}
              </div>
              <p className="text-[11px] leading-relaxed text-slate-700">
                {selectedChoice.feedback}
              </p>
            </div>
          )}
        </div>
      );
    }

    case 'assessment': {
      const data = block.data as AssessmentBlockData;
      return (
        <div className="my-6 p-6 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {data.title || 'Module Assessment'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Verify your competency through the formal knowledge assessment test for this module.
            </p>
          </div>
          {onLaunchAssessment && (
            <button
              onClick={() => onLaunchAssessment(data.assessmentId)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              Start Knowledge Assessment →
            </button>
          )}
        </div>
      );
    }

    case 'assignment': {
      const data = block.data as AssignmentBlockData;
      return (
        <div className="my-5 p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            <UploadCloud className="w-4 h-4 text-blue-600" />
            <span>Practical Assignment</span>
          </div>

          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {data.prompt}
          </p>

          {data.rubric && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              <span className="font-bold text-slate-700 block mb-0.5">Evaluation Rubric:</span>
              {data.rubric}
            </div>
          )}

          {!assignmentSubmitted ? (
            <div className="space-y-2 pt-1">
              <textarea
                rows={3}
                value={assignmentText}
                onChange={(e) => setAssignmentText(e.target.value)}
                placeholder="Enter your practical coaching reflection or assignment details..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-900"
              />
              <div className="flex justify-end">
                <button
                  disabled={!assignmentText.trim()}
                  onClick={() => setAssignmentSubmitted(true)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Assignment submitted successfully for instructor evaluation.</span>
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
};
