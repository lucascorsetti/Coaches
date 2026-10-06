import React, { useState, useEffect } from 'react';
import { 
  Course, 
  Module, 
  LearningItem, 
  ContentBlock, 
  Category, 
  Assessment, 
  Question,
  ContentBlockType 
} from '../../types';
import { 
  courseRepository, 
  categoryRepository, 
  assessmentRepository 
} from '../../repositories';
import { useTranslation } from '../../i18n/translations';
import { StatusBadge } from '../common/StatusBadge';
import { BlockEditor } from './BlockEditor';
import { LessonPlayer } from '../learner/LessonPlayer';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Sparkles,
  Type,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  HelpCircle,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface CourseEditorProps {
  courseId: string;
  onBack: () => void;
  onPreview: (courseId: string, lessonId?: string) => void;
}

type EditorTab = 'info' | 'structure' | 'assessment' | 'access';

export const CourseEditor: React.FC<CourseEditorProps> = ({
  courseId,
  onBack,
  onPreview
}) => {
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<EditorTab>('structure');
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleItems, setModuleItems] = useState<Record<string, LearningItem[]>>({});
  
  // Selection
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [currentBlocks, setCurrentBlocks] = useState<ContentBlock[]>([]);
  
  // Assessment
  const [assessment, setAssessment] = useState<Assessment | null>(null);

  // Modals / forms
  const [showAddContentMenu, setShowAddContentMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [c, cats, mods] = await Promise.all([
        courseRepository.getCourseById(courseId),
        categoryRepository.getAllCategories(),
        courseRepository.getModulesByCourseId(courseId)
      ]);

      setCourse(c);
      setCategories(cats);
      setModules(mods);

      const itemsMap: Record<string, LearningItem[]> = {};
      for (const m of mods) {
        itemsMap[m.id] = await courseRepository.getItemsByModuleId(m.id);
      }
      setModuleItems(itemsMap);

      if (mods.length > 0) {
        setSelectedModuleId(mods[0].id);
        const firstItems = itemsMap[mods[0].id] || [];
        if (firstItems.length > 0) {
          setSelectedItemId(firstItems[0].id);
        }
      }

      // Check for assessments belonging to this course
      const courseAssessments = await assessmentRepository.getAssessmentsByCourse(courseId);
      if (courseAssessments.length > 0) {
        setAssessment(courseAssessments[0]);
      } else {
        setAssessment(null);
      }
    }
    loadData();
  }, [courseId]);

  // Load blocks when selected item changes
  useEffect(() => {
    async function loadBlocks() {
      if (selectedItemId) {
        const blks = await courseRepository.getBlocksByItemId(selectedItemId);
        setCurrentBlocks(blks);

        // If block is an assessment, load its actual linked assessment
        const assessBlock = blks.find((b) => b.type === 'assessment');
        if (assessBlock && assessBlock.data) {
          const aId = (assessBlock.data as { assessmentId?: string }).assessmentId;
          if (aId) {
            const linked = await assessmentRepository.getAssessmentById(aId);
            if (linked) setAssessment(linked);
          }
        }
      } else {
        setCurrentBlocks([]);
      }
    }
    loadBlocks();
  }, [selectedItemId]);

  if (!course) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading course authoring workspace...</div>;
  }

  // --- Course Metadata Changes ---
  const handleUpdateCourseMeta = (fields: Partial<Course>) => {
    setCourse({ ...course, ...fields });
  };

  const handleSaveCourse = async (newStatus?: Course['status']) => {
    setIsSaving(true);
    
    // Validate course code uniqueness & presence
    const validation = await courseRepository.validateCourseCode(course.courseCode, course.id);
    if (!validation.valid) {
      alert(validation.error || 'Invalid course code');
      setIsSaving(false);
      return;
    }

    const updated = {
      ...course,
      status: newStatus || course.status,
      updatedAt: new Date().toISOString(),
      publishedAt: newStatus === 'published' ? (course.publishedAt || new Date().toISOString()) : course.publishedAt
    };
    try {
      await courseRepository.saveCourse(updated);
      setCourse(updated);
      setIsSaving(false);
      setSaveSuccessMessage(true);
      setTimeout(() => setSaveSuccessMessage(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Error saving course');
      setIsSaving(false);
    }
  };

  // --- Module Operations ---
  const handleAddModule = async () => {
    const newMod: Module = {
      id: `mod-${Date.now()}`,
      courseId: course.id,
      title: `Module ${modules.length + 1}: New Topic Section`,
      description: 'Enter module overview and coaching objectives',
      order: modules.length + 1
    };
    await courseRepository.saveModule(newMod);
    const updatedMods = [...modules, newMod];
    setModules(updatedMods);
    setSelectedModuleId(newMod.id);
    setModuleItems({ ...moduleItems, [newMod.id]: [] });
  };

  const handleUpdateModuleTitle = async (moduleId: string, title: string) => {
    const target = modules.find((m) => m.id === moduleId);
    if (!target) return;
    const updated = { ...target, title };
    await courseRepository.saveModule(updated);
    setModules(modules.map((m) => (m.id === moduleId ? updated : m)));
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    await courseRepository.deleteModule(moduleId);
    const remaining = modules.filter((m) => m.id !== moduleId);
    setModules(remaining);
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(remaining[0]?.id || null);
      setSelectedItemId(null);
    }
  };

  // --- Lesson Operations ---
  const handleAddLesson = async (moduleId: string, type: LearningItem['type'] = 'lesson') => {
    const existing = moduleItems[moduleId] || [];
    const newItem: LearningItem = {
      id: `item-${Date.now()}`,
      moduleId,
      title: `${modules.findIndex((m) => m.id === moduleId) + 1}.${existing.length + 1} New Lesson`,
      description: 'Lesson description and coaching competencies',
      type,
      order: existing.length + 1,
      estimatedDuration: '10 mins'
    };
    await courseRepository.saveItem(newItem);
    setModuleItems({
      ...moduleItems,
      [moduleId]: [...existing, newItem]
    });
    setSelectedItemId(newItem.id);

    // Seed with a default heading block
    const defaultHeading: ContentBlock = {
      id: `block-${Date.now()}`,
      learningItemId: newItem.id,
      type: 'heading',
      order: 1,
      data: { level: 1, text: newItem.title }
    };
    await courseRepository.saveBlock(defaultHeading);
    setCurrentBlocks([defaultHeading]);
  };

  const handleUpdateLessonTitle = async (itemId: string, title: string) => {
    const item = await courseRepository.getItemById(itemId);
    if (!item) return;
    const updated = { ...item, title };
    await courseRepository.saveItem(updated);
    setModuleItems({
      ...moduleItems,
      [item.moduleId]: (moduleItems[item.moduleId] || []).map((i) => (i.id === itemId ? updated : i))
    });
  };

  const handleDeleteLesson = async (moduleId: string, itemId: string) => {
    if (!window.confirm('Delete this lesson and all its content blocks?')) return;
    await courseRepository.deleteItem(itemId);
    setModuleItems({
      ...moduleItems,
      [moduleId]: (moduleItems[moduleId] || []).filter((i) => i.id !== itemId)
    });
    if (selectedItemId === itemId) {
      const remaining = (moduleItems[moduleId] || []).filter((i) => i.id !== itemId);
      setSelectedItemId(remaining[0]?.id || null);
    }
  };

  // --- Content Block Operations ---
  const handleAddBlock = async (type: ContentBlockType) => {
    if (!selectedItemId) return;

    let initialData: ContentBlock['data'];
    switch (type) {
      case 'heading':
        initialData = { level: 2, text: 'New Section Header' };
        break;
      case 'text':
        initialData = { content: 'Explain coaching principles, execution rules, and tactical focus here.' };
        break;
      case 'image':
        initialData = { 
          url: 'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
          caption: 'Tactical diagram caption'
        };
        break;
      case 'video':
        initialData = {
          title: 'Drill Video Walkthrough',
          sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          durationMinutes: 5
        };
        break;
      case 'document':
        initialData = {
          title: 'Coaching Practice Sheet (PDF)',
          fileUrl: '#download-pdf',
          format: 'PDF',
          fileSize: '1.2 MB'
        };
        break;
      case 'callout':
        initialData = {
          style: 'tip',
          title: 'Coaching Cue',
          text: 'Maintain low center of gravity through outside edge turns.'
        };
        break;
      case 'question':
        initialData = {
          question: 'What is the primary visual cue on this breakout?',
          options: ['Defenseman head up along boards', 'Goalie stick tap', 'Center stationary at red line'],
          correctIndex: 0,
          explanation: 'Reading the puck carrier head elevation signals pass readiness.'
        };
        break;
      case 'scenario':
        initialData = {
          title: 'Power Play Pressure Scenario',
          situation: 'The opponent penalty kill aggressively attacks the high blue line quarterback.',
          choices: [
            { id: 'c1', text: 'Force shot through defenseman shins', feedback: 'High turnover risk leading to shorthanded breakaway.', isCorrect: false },
            { id: 'c2', text: 'Slide puck diagonally to half-wall bumper option', feedback: 'Bypasses the forecheck and creates high-danger slot chance.', isCorrect: true }
          ]
        };
        break;
      case 'assessment':
        initialData = {
          assessmentId: 'assess-demo-1',
          title: 'End of Module Assessment Test'
        };
        break;
      case 'assignment':
        initialData = {
          prompt: 'Diagram a 2-on-1 regroup drill suitable for U15 players.',
          rubric: 'Clear ice markings, player roles identified, progression step.'
        };
        break;
      default:
        initialData = { content: 'Default block content' };
    }

    const newBlock: ContentBlock = {
      id: `blk-${Date.now()}`,
      learningItemId: selectedItemId,
      type,
      order: currentBlocks.length + 1,
      data: initialData
    };

    await courseRepository.saveBlock(newBlock);
    setCurrentBlocks([...currentBlocks, newBlock]);
    setShowAddContentMenu(false);
  };

  const handleUpdateBlock = async (updated: ContentBlock) => {
    await courseRepository.saveBlock(updated);
    setCurrentBlocks(currentBlocks.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteBlock = async (blockId: string) => {
    await courseRepository.deleteBlock(blockId);
    setCurrentBlocks(currentBlocks.filter((b) => b.id !== blockId));
  };

  const handleMoveBlock = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentBlocks.length) return;

    const list = [...currentBlocks];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reorderedIds = list.map((b) => b.id);
    if (selectedItemId) {
      await courseRepository.reorderBlocks(selectedItemId, reorderedIds);
      setCurrentBlocks(list);
    }
  };

  // Preview Mode
  if (isPreviewActive) {
    const firstItemId = selectedItemId || Object.values(moduleItems)[0]?.[0]?.id || 'item-101';
    return (
      <div className="space-y-4">
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-16 z-50 shadow-md">
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>AUTHOR PREVIEW MODE: Viewing course as a learner will see it.</span>
          </span>
          <button
            onClick={() => setIsPreviewActive(false)}
            className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-slate-800"
          >
            Exit Preview & Return to Editor
          </button>
        </div>
        <LessonPlayer
          courseId={course.id}
          initialLessonId={firstItemId}
          onExit={() => setIsPreviewActive(false)}
        />
      </div>
    );
  }

  const selectedLesson = Object.values(moduleItems).flat().find((i) => i.id === selectedItemId);

  return (
    <div className="space-y-5">
      {/* Top Author Navigation & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Authoring Mode
              </span>
              <StatusBadge status={course.status} size="sm" />
              {saveSuccessMessage && (
                <span className="text-xs text-emerald-600 font-bold animate-pulse">
                  ✓ Changes Saved
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewActive(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
            title="Preview Course as Learner"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('previewCourse')}</span>
          </button>

          <button
            onClick={() => handleSaveCourse('draft')}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('saveDraft')}</span>
          </button>

          <button
            onClick={() => handleSaveCourse('published')}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all flex items-center gap-1.5 active:scale-98"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('publishCourse')}</span>
          </button>
        </div>
      </div>

      {/* Editor Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200 bg-white px-4 rounded-xl shadow-2xs">
        <button
          onClick={() => setActiveTab('structure')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'structure'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Modules & Content Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Details & Accreditation Level</span>
        </button>

        <button
          onClick={() => setActiveTab('assessment')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'assessment'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Assessment & Exam Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('access')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'access'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Course Access & Completion</span>
        </button>
      </div>

      {/* TAB 1: MODULES & CONTENT BUILDER */}
      {activeTab === 'structure' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (4 cols): Modules & Lessons Hierarchy Organizer */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-2xs h-fit">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 font-mono">
                Course Structure
              </span>
              <button
                onClick={handleAddModule}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Module</span>
              </button>
            </div>

            <div className="space-y-3">
              {modules.map((mod, modIdx) => {
                const items = moduleItems[mod.id] || [];
                const isSelectedModule = selectedModuleId === mod.id;

                return (
                  <div
                    key={mod.id}
                    className={`rounded-xl border transition-all ${
                      isSelectedModule ? 'border-blue-300 bg-blue-50/20' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    {/* Module Title Row */}
                    <div className="p-3 flex items-center justify-between gap-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-400 shrink-0">
                          M{modIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => handleUpdateModuleTitle(mod.id, e.target.value)}
                          className="bg-transparent font-bold text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full truncate"
                        />
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleAddLesson(mod.id, 'lesson')}
                          className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-1.5 py-0.5 rounded bg-white border border-slate-200"
                          title="Add Lesson to Module"
                        >
                          + Lesson
                        </button>
                        <button
                          onClick={() => handleDeleteModule(mod.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons list under this module */}
                    <div className="p-2 space-y-1">
                      {items.map((item) => {
                        const isSelectedLesson = selectedItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedModuleId(mod.id);
                              setSelectedItemId(item.id);
                            }}
                            className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                              isSelectedLesson
                                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded ${
                                isSelectedLesson ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {item.type}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLesson(mod.id, item.id);
                                }}
                                className={`p-0.5 ${isSelectedLesson ? 'text-blue-200 hover:text-white' : 'text-slate-400 hover:text-rose-600'}`}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {items.length === 0 && (
                        <div className="text-[11px] text-slate-400 italic p-2 text-center">
                          No lessons yet. Click "+ Lesson" above.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (8 cols): Content Blocks Manager for Selected Lesson */}
          <div className="lg:col-span-8 space-y-4">
            {selectedLesson ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5 shadow-2xs">
                {/* Lesson Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-0.5 flex-1 min-w-[200px]">
                    <span className="font-mono text-[10px] uppercase font-bold text-blue-700">
                      Editing Content Blocks
                    </span>
                    <input
                      type="text"
                      value={selectedLesson.title}
                      onChange={(e) => handleUpdateLessonTitle(selectedLesson.id, e.target.value)}
                      className="font-extrabold text-base sm:text-lg text-slate-900 w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 bg-transparent"
                    />
                  </div>

                  {/* Add Content Block Trigger Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAddContentMenu(!showAddContentMenu)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('addContentBlock')}</span>
                    </button>

                    {/* Content Block Type Dropdown Menu */}
                    {showAddContentMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1">
                        <div className="px-3 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                          Select Content Type
                        </div>
                        <button
                          onClick={() => handleAddBlock('heading')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <Type className="w-4 h-4 text-blue-600" />
                          <span>Heading & Title</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('text')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span>Rich Text / Markdown</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('image')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <ImageIcon className="w-4 h-4 text-emerald-600" />
                          <span>Image Placeholder</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('video')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <VideoIcon className="w-4 h-4 text-rose-600" />
                          <span>Video Lesson</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('document')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <FileCheck2 className="w-4 h-4 text-purple-600" />
                          <span>PDF / Document Resource</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('callout')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Safety / Tip Callout</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('question')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          <span>Quick Check Question</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('scenario')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>On-Ice Scenario Decision</span>
                        </button>
                        <button
                          onClick={() => handleAddBlock('assignment')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 text-slate-800"
                        >
                          <UploadCloud className="w-4 h-4 text-indigo-600" />
                          <span>Practical Assignment Task</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                  {currentBlocks.map((block, bIdx) => (
                    <div
                      key={block.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs space-y-3"
                    >
                      {/* Block Controls Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                            Block {bIdx + 1}: {block.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMoveBlock(bIdx, 'up')}
                            disabled={bIdx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveBlock(bIdx, 'down')}
                            disabled={bIdx === currentBlocks.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                            title="Delete Block"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Visual Inline Editor */}
                      <BlockEditor
                        block={block}
                        onChange={handleUpdateBlock}
                      />
                    </div>
                  ))}

                  {currentBlocks.length === 0 && (
                    <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-sm text-slate-600 font-medium">
                        This lesson has no content blocks yet.
                      </p>
                      <button
                        onClick={() => setShowAddContentMenu(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        + Add First Block (Text, Video, or Quiz)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600 font-medium">
                  Select a lesson from the left structure tree to edit its content blocks.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COURSE DETAILS & ACCREDITATION LEVEL */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 max-w-3xl shadow-2xs">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Course Metadata & Accreditation Classification
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Course Title *</label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => handleUpdateCourseMeta({ title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Course Product Code (Internal Matching Key) */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-amber-950 font-semibold text-xs">
                  Course Product Code (Internal Matching Key) *
                </label>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 border border-amber-300">
                  Required & Unique
                </span>
              </div>
              <input
                type="text"
                value={course.courseCode || ''}
                onChange={(e) => handleUpdateCourseMeta({ courseCode: e.target.value })}
                placeholder="e.g. 10001, 10002, 20001"
                className="w-full bg-white border border-amber-300 rounded-lg p-2.5 font-mono text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-amber-900/80 leading-relaxed">
                Silent internal identifier matching external registration & purchase events (e.g. <code className="font-mono font-bold">10001</code>). Visible to authors and administrators; never prominently displayed to learners.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Short Display Title</label>
                <input
                  type="text"
                  value={course.shortTitle || ''}
                  onChange={(e) => handleUpdateCourseMeta({ shortTitle: e.target.value })}
                  placeholder="e.g. Coaching Foundation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Estimated Duration</label>
                <input
                  type="text"
                  value={course.estimatedDuration}
                  onChange={(e) => handleUpdateCourseMeta({ estimatedDuration: e.target.value })}
                  placeholder="e.g. 45 mins or 8 hours"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Federation Category</label>
                <select
                  value={course.categoryId}
                  onChange={(e) => handleUpdateCourseMeta({ categoryId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'it' && c.nameIt ? c.nameIt : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Accreditation Level</label>
                <input
                  type="text"
                  value={course.level}
                  onChange={(e) => handleUpdateCourseMeta({ level: e.target.value })}
                  placeholder="e.g. Maestro di Base, Level 1, Level 2, Beginner..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cover Thumbnail Image URL</label>
              <input
                type="text"
                value={course.thumbnail}
                onChange={(e) => handleUpdateCourseMeta({ thumbnail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Course Description & Overview</label>
              <textarea
                rows={4}
                value={course.description}
                onChange={(e) => handleUpdateCourseMeta({ description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:bg-white leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => handleSaveCourse()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASSESSMENT & EXAM RULES */}
      {activeTab === 'assessment' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 max-w-4xl shadow-2xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Evaluation Test Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Configure passing thresholds, attempt limits, and knowledge questions.
              </p>
            </div>
            {assessment && (
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {assessment.questions.length} Questions
              </span>
            )}
          </div>

          {assessment ? (
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Passing Score Threshold (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={assessment.passingScore}
                    onChange={(e) => setAssessment({ ...assessment, passingScore: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Maximum Attempts (0 = unlimited)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={assessment.maxAttempts}
                    onChange={(e) => setAssessment({ ...assessment, maxAttempts: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reveal Answers Post-Test</label>
                  <select
                    value={assessment.revealAnswers ? 'yes' : 'no'}
                    onChange={(e) => setAssessment({ ...assessment, revealAnswers: e.target.value === 'yes' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                  >
                    <option value="yes">Yes - Show Explanations</option>
                    <option value="no">No - Blind Test</option>
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wide font-mono block">
                  Question Bank ({assessment.questions.length})
                </span>

                <div className="space-y-3">
                  {assessment.questions.map((q, qIdx) => (
                    <div key={q.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          {qIdx + 1}. {q.question}
                        </span>
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          {q.type} • {q.points} pts
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                        <span className="font-semibold block text-slate-700">Options:</span>
                        {q.options.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-1.5">
                            <span className={q.correctAnswers.includes(opt.id) ? 'text-emerald-700 font-bold' : ''}>
                              {q.correctAnswers.includes(opt.id) ? '✓' : '•'} {opt.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <p className="text-[11px] text-slate-500 italic">
                          Explanation: "{q.explanation}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No formal assessment linked to this course.</p>
          )}
        </div>
      )}

      {/* TAB 4: COURSE ACCESS & COMPLETION RULES */}
      {activeTab === 'access' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900 tracking-tight">
              Course Access & Completion Requirements
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure who is authorized to view this course and the criteria required for certified completion.
            </p>
          </div>

          {/* Visibility Policy */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Access & Visibility Policy
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border-2 border-blue-600 bg-blue-50/50 space-y-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900">Private / Enrollment Required</span>
                  <span className="font-mono text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded">Default</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Strictly hidden from public catalog. Learners must be individually approved and enrolled by administrators.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60 space-y-1">
                <div className="font-bold text-xs text-slate-800">Restricted / Cohort Invite</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Visible only to accredited regional clubs and nominated participants.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60 space-y-1">
                <div className="font-bold text-xs text-slate-800">Internal Federation Staff</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Restricted to technical directors, referee supervisors, and examiners.
                </p>
              </div>
            </div>
          </div>

          {/* Completion Requirements */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Certified Completion Criteria
            </label>

            <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={course.completionRules?.requireAllLessons ?? true}
                  onChange={(e) => {
                    const rules = {
                      requireAllLessons: e.target.checked,
                      requireAllAssessmentsPassed: course.completionRules?.requireAllAssessmentsPassed ?? true,
                      minimumPassingScore: course.completionRules?.minimumPassingScore ?? 75
                    };
                    setCourse({ ...course, completionRules: rules });
                  }}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-900">Require all lessons completed</div>
                  <div className="text-[11px] text-slate-500">
                    The learner must mark each reading, video, and scenario item as complete.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-slate-200/60">
                <input
                  type="checkbox"
                  checked={course.completionRules?.requireAllAssessmentsPassed ?? true}
                  onChange={(e) => {
                    const rules = {
                      requireAllLessons: course.completionRules?.requireAllLessons ?? true,
                      requireAllAssessmentsPassed: e.target.checked,
                      minimumPassingScore: course.completionRules?.minimumPassingScore ?? 75
                    };
                    setCourse({ ...course, completionRules: rules });
                  }}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-900">Require all graded assessments passed</div>
                  <div className="text-[11px] text-slate-500">
                    Knowledge evaluation quizzes must meet the passing threshold.
                  </div>
                </div>
              </label>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">Minimum overall passing score (%)</div>
                  <div className="text-[11px] text-slate-500">Score percentage required across all assessments</div>
                </div>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={course.completionRules?.minimumPassingScore ?? 75}
                  onChange={(e) => {
                    const rules = {
                      requireAllLessons: course.completionRules?.requireAllLessons ?? true,
                      requireAllAssessmentsPassed: course.completionRules?.requireAllAssessmentsPassed ?? true,
                      minimumPassingScore: parseInt(e.target.value) || 75
                    };
                    setCourse({ ...course, completionRules: rules });
                  }}
                  className="w-20 px-2 py-1 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
