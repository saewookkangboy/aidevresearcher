/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { Settings, GripVertical, Eye, EyeOff, RotateCcw, Save, X } from 'lucide-react';

export function AdminPanel() {
  const {
    isAdminMode,
    layoutConfig,
    toggleAdminMode,
    updateUnitOrder,
    toggleUnitVisibility,
    resetLayout,
    saveLayout,
  } = useAdmin();

  const [draggedUnit, setDraggedUnit] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!isAdminMode) {
    return (
      <button
        onClick={toggleAdminMode}
        className="fixed bottom-4 right-4 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors touch-manipulation"
        title="Admin 모드 활성화"
        aria-label="Admin 모드"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  const sortedUnits = [...layoutConfig.units].sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, unitId: string) => {
    setDraggedUnit(unitId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', unitId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedUnit) return;

    const newOrder = [...sortedUnits];
    const draggedIndex = newOrder.findIndex(u => u.id === draggedUnit);
    
    if (draggedIndex === -1) return;

    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    const unitIds = newOrder.map(u => u.id);
    updateUnitOrder(unitIds);

    setDraggedUnit(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedUnit(null);
    setDragOverIndex(null);
  };

  const categoryColors: Record<string, string> = {
    guide: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    search: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    planning: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    status: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    content: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
    ingestion: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    advanced: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    system: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Admin - 레이아웃 관리
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={saveLayout}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors flex items-center gap-2 text-sm touch-manipulation min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">저장</span>
            </button>
            <button
              onClick={toggleAdminMode}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Admin 모드 종료"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              드래그하여 순서를 변경하고, 눈 아이콘을 클릭하여 표시/숨김을 전환하세요.
            </p>
            <button
              onClick={resetLayout}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 transition-colors flex items-center gap-2 text-sm touch-manipulation min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">초기화</span>
            </button>
          </div>

          <div className="space-y-2">
            {sortedUnits.map((unit, index) => (
              <div
                key={unit.id}
                draggable
                onDragStart={(e) => handleDragStart(e, unit.id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-move touch-manipulation ${
                  draggedUnit === unit.id
                    ? 'opacity-50 border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    : dragOverIndex === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : unit.enabled
                    ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60'
                }`}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Order Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>

                {/* Unit Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {unit.name}
                    </h3>
                    {unit.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[unit.category] || categoryColors.system}`}>
                        {unit.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {unit.component}
                  </p>
                </div>

                {/* Toggle Visibility */}
                <button
                  onClick={() => toggleUnitVisibility(unit.id)}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    unit.enabled
                      ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={unit.enabled ? '숨기기' : '표시하기'}
                >
                  {unit.enabled ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {sortedUnits.length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">전체 단위</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {sortedUnits.filter(u => u.enabled).length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">활성화됨</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {sortedUnits.filter(u => !u.enabled).length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">비활성화됨</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {new Set(sortedUnits.map(u => u.category)).size}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">카테고리</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
