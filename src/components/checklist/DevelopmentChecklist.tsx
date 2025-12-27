import { useEffect, useState } from 'react';
import { useChecklist } from '../../contexts/ChecklistContext';
import { DevelopmentTask, AgentRole } from '../../utils/types';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Clock, AlertCircle, User } from 'lucide-react';
import { ROLE_LABELS, ROLE_ICONS } from '../../utils/roleConfigs';

const AVAILABLE_ROLES: AgentRole[] = ['frontend', 'backend', 'pm', 'fullstack', 'devops', 'designer'];

export function DevelopmentChecklist() {
  const { currentChecklist, loading, createChecklist, toggleTask, getProgress, loadChecklist } = useChecklist();
  const [selectedRole, setSelectedRole] = useState<AgentRole | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [projectName, setProjectName] = useState('');
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);

  useEffect(() => {
    if (selectedRole) {
      loadChecklist(selectedRole);
    }
  }, [selectedRole, loadChecklist]);

  const handleCreateChecklist = async () => {
    if (!selectedRole || !projectName.trim()) return;
    await createChecklist(selectedRole, projectName);
    // 모든 Phase를 확장
    if (currentChecklist) {
      setExpandedPhases(new Set(currentChecklist.phases.map(p => p.id)));
    }
  };

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const progress = getProgress();

  if (!selectedRole) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          개발 체크리스트
        </h3>
        <div className="relative">
          <button
            onClick={() => setIsRoleSelectorOpen(!isRoleSelectorOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500">개발 역할을 선택하세요</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isRoleSelectorOpen ? 'rotate-180' : ''}`} />
          </button>

          {isRoleSelectorOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsRoleSelectorOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">
                    역할 선택
                  </div>
                  {AVAILABLE_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setIsRoleSelectorOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl">{ROLE_ICONS[role as Exclude<AgentRole, null>]}</span>
                      <span className="flex-1 text-left">{ROLE_LABELS[role as Exclude<AgentRole, null>]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!currentChecklist) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedRole && ROLE_LABELS[selectedRole as Exclude<AgentRole, null>]} 개발 체크리스트 생성
          </h3>
          <button
            onClick={() => setSelectedRole(null)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            역할 변경
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
              프로젝트 이름
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="예: Vibe Coding Navigator"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={handleCreateChecklist}
            disabled={!projectName.trim() || loading}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '생성 중...' : '체크리스트 생성'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {currentChecklist.projectName}
          </h3>
          <p className="text-sm text-gray-500">
            {currentChecklist.role && ROLE_LABELS[currentChecklist.role]} 개발 체크리스트
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{progress.percentage}%</div>
            <div className="text-xs text-gray-500">
              {progress.completed} / {progress.total} 완료
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedRole(null);
              setProjectName('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            새 체크리스트
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {currentChecklist.phases.map((phase) => {
          const phaseProgress = {
            completed: phase.tasks.filter(t => t.completed).length,
            total: phase.tasks.length,
          };
          const isExpanded = expandedPhases.has(phase.id);
          const isPhaseComplete = phase.tasks.every(t => t.completed);

          return (
            <div
              key={phase.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isPhaseComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      Phase {phase.order}: {phase.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {phaseProgress.completed} / {phaseProgress.total} 완료
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                  {phase.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(phase.id, task.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
}: {
  task: DevelopmentTask;
  onToggle: () => void;
}) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <button
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0"
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div
              className={`font-medium ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {task.title}
            </div>
            <div className="text-sm text-gray-600 mt-1">{task.description}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {task.estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {task.estimatedTime}
              </div>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[task.priority]}`}
            >
              {task.priority === 'high' && <AlertCircle className="w-3 h-3 inline mr-1" />}
              {task.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

