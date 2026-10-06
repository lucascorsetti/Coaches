import React from 'react';
import { 
  ContentBlock, 
  HeadingBlockData, 
  TextBlockData, 
  ImageBlockData, 
  VideoBlockData, 
  DocumentBlockData, 
  CalloutBlockData, 
  QuestionBlockData, 
  ScenarioBlockData, 
  AssignmentBlockData 
} from '../../types';

interface BlockEditorProps {
  block: ContentBlock;
  onChange: (updatedBlock: ContentBlock) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onChange }) => {
  const updateData = (fields: Record<string, unknown>) => {
    onChange({
      ...block,
      data: {
        ...(block.data as Record<string, unknown>),
        ...fields
      } as ContentBlock['data']
    });
  };

  switch (block.type) {
    case 'heading': {
      const data = block.data as HeadingBlockData;
      return (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Heading Text</label>
              <input
                type="text"
                value={data.text || ''}
                onChange={(e) => updateData({ text: e.target.value })}
                placeholder="Enter section heading..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:bg-white focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Heading Level</label>
              <select
                value={data.level || 1}
                onChange={(e) => updateData({ level: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              >
                <option value={1}>H1 - Main Title</option>
                <option value={2}>H2 - Section Header</option>
                <option value={3}>H3 - Sub-header</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Subtitle (Optional)</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              placeholder="Enter section subtitle or summary..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
        </div>
      );
    }

    case 'text': {
      const data = block.data as TextBlockData;
      return (
        <div className="space-y-2 text-xs">
          <label className="block text-slate-700 font-semibold">Content Text (Markdown formatting supported)</label>
          <textarea
            rows={5}
            value={data.content || ''}
            onChange={(e) => updateData({ content: e.target.value })}
            placeholder="Enter lesson text, explanation, bullet points, and learning instructions..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
          />
          <div className="text-[11px] text-slate-400 font-mono">
            Tip: Use * for bullet points, ## for subheadings, or **bold** for emphasis.
          </div>
        </div>
      );
    }

    case 'image': {
      const data = block.data as ImageBlockData;
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Image URL or Storage Reference</label>
            <input
              type="text"
              value={data.url || ''}
              onChange={(e) => updateData({ url: e.target.value })}
              placeholder="https://example.com/diagram.jpg"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Caption</label>
              <input
                type="text"
                value={data.caption || ''}
                onChange={(e) => updateData({ caption: e.target.value })}
                placeholder="Figure 1: Explanatory diagram or photo"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Accessibility Alt Text</label>
              <input
                type="text"
                value={data.alt || ''}
                onChange={(e) => updateData({ alt: e.target.value })}
                placeholder="Description for assistive readers"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    case 'video': {
      const data = block.data as VideoBlockData;
      return (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Video Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="e.g. Topic Demonstration and Walkthrough"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Duration (Mins)</label>
              <input
                type="number"
                min="1"
                value={data.durationMinutes || 5}
                onChange={(e) => updateData({ durationMinutes: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Video Source URL (Storage reference or direct link)</label>
            <input
              type="text"
              value={data.sourceUrl || ''}
              onChange={(e) => updateData({ sourceUrl: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
        </div>
      );
    }

    case 'document': {
      const data = block.data as DocumentBlockData;
      return (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="e.g. Reference Guide or Study Material"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">File Format & Size</label>
              <input
                type="text"
                value={`${data.format || 'PDF'} (${data.fileSize || '1.0 MB'})`}
                onChange={(e) => updateData({ format: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Document Download URL</label>
            <input
              type="text"
              value={data.fileUrl || ''}
              onChange={(e) => updateData({ fileUrl: e.target.value })}
              placeholder="https://example.com/document.pdf"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
        </div>
      );
    }

    case 'callout': {
      const data = block.data as CalloutBlockData;
      return (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Callout Style</label>
              <select
                value={data.style || 'info'}
                onChange={(e) => updateData({ style: e.target.value as CalloutBlockData['style'] })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              >
                <option value="info">🔵 Information</option>
                <option value="tip">🟢 Key Tip</option>
                <option value="warning">🟡 Caution</option>
                <option value="rule">🔴 Important Rule</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Callout Title</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="e.g. Important Takeaway"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Callout Message</label>
            <textarea
              rows={2}
              value={data.text || ''}
              onChange={(e) => updateData({ text: e.target.value })}
              placeholder="Enter callout note or instruction for learners..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
        </div>
      );
    }

    case 'question': {
      const data = block.data as QuestionBlockData;
      const options = data.options || ['Option A', 'Option B'];

      const handleOptionChange = (idx: number, text: string) => {
        const updated = [...options];
        updated[idx] = text;
        updateData({ options: updated });
      };

      const handleAddOption = () => {
        updateData({ options: [...options, `Option ${String.fromCharCode(65 + options.length)}`] });
      };

      const handleRemoveOption = (idx: number) => {
        if (options.length <= 2) return;
        const updated = options.filter((_, i) => i !== idx);
        updateData({ 
          options: updated, 
          correctIndex: Math.min(data.correctIndex, updated.length - 1) 
        });
      };

      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Check Question</label>
            <input
              type="text"
              value={data.question || ''}
              onChange={(e) => updateData({ question: e.target.value })}
              placeholder="Enter question text..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-slate-700 font-semibold">Answer Choices (Select correct answer):</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${block.id}`}
                  checked={data.correctIndex === idx}
                  onChange={() => updateData({ correctIndex: idx })}
                  className="w-4 h-4 text-blue-600 shrink-0"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Choice ${idx + 1}`}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-900 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="text-slate-400 hover:text-rose-600 px-1 font-bold text-sm"
                  title="Remove option"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1"
            >
              + Add Choice
            </button>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Explanation (Shown after answering)</label>
            <input
              type="text"
              value={data.explanation || ''}
              onChange={(e) => updateData({ explanation: e.target.value })}
              placeholder="Why this answer is correct..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
        </div>
      );
    }

    case 'scenario': {
      const data = block.data as ScenarioBlockData;
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Scenario Title</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="e.g. Case Study or Decision Dilemma"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Situation Prompt</label>
            <textarea
              rows={2}
              value={data.situation || ''}
              onChange={(e) => updateData({ situation: e.target.value })}
              placeholder="Describe the situation and choices for the learner..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
            <span className="font-semibold block mb-1">Decision Branching:</span>
            <span>Scenario choices and feedback configured ({data.choices?.length || 0} branches).</span>
          </div>
        </div>
      );
    }

    case 'assignment': {
      const data = block.data as AssignmentBlockData;
      return (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assignment Task Prompt</label>
            <textarea
              rows={3}
              value={data.prompt || ''}
              onChange={(e) => updateData({ prompt: e.target.value })}
              placeholder="Enter assignment requirements and instructions..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Evaluation Rubric</label>
            <input
              type="text"
              value={data.rubric || ''}
              onChange={(e) => updateData({ rubric: e.target.value })}
              placeholder="Enter grading rubric and evaluation criteria..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 text-xs"
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};
