/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, useMemo } from 'react';
import { Resource, LinkStatus } from '../../utils/types';
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_TO_CATEGORY, CATEGORY_LABELS, CATEGORY_ICONS } from '../../utils/constants';
import { StatusBadge } from '../common/StatusBadge';
import { SourceBadge } from '../common/SourceBadge';
import { CommandCopyButton } from './CommandCopyButton';
import { ExternalLink, Star, Heart, Share2, Edit2, Check, X, Loader2, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { formatNumber, truncateText } from '../../utils/formatters';
import { useResources } from '../../contexts/ResourceContext';
import { LinkHealthService } from '../../services/api/linkHealthService';
import { IngestionSimulator } from '../../services/simulation/ingestionSimulator';
import { detectDangerousCommand, getVulnerabilityFindings } from '../../utils/safety';
import { DevAgentExecutor } from '../../services/simulation/devAgentExecutor';

interface ResourceCardProps {
  resource: Resource;
  onViewDetails?: (resource: Resource) => void;
}

function getTrustScore(resource: Resource) {
  let score = 50;

  if (resource.isVerified) score += 15;
  if (resource.stars && resource.stars > 5000) score += 12;
  else if (resource.stars && resource.stars > 500) score += 7;
  if (resource.socialMetrics && resource.socialMetrics.likes > 500) score += 5;

  if (resource.linkStatus === 'active') score += 10;
  if (resource.linkStatus === 'fixed') score += 4;
  if (resource.linkStatus === 'broken') score -= 20;

  const updatedAt = new Date(resource.updatedAt || resource.createdAt);
  const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate <= 30) score += 8;
  else if (daysSinceUpdate <= 90) score += 4;

  if (resource.sourceType === 'GITHUB') score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getTrustLabel(score: number) {
  if (score >= 75) return { label: '신뢰 높음', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800' };
  if (score >= 50) return { label: '신뢰 보통', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700' };
  return { label: '검토 필요', className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800' };
}

function formatDateLabel(value?: string) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('ko-KR');
}

export function ResourceCard({ resource, onViewDetails }: ResourceCardProps) {
  const [runState, setRunState] = useState<'idle' | 'running' | 'done'>('idle');
  const [runNote, setRunNote] = useState<string | null>(null);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editUrl, setEditUrl] = useState(resource.url);
  const [urlValidationStatus, setUrlValidationStatus] = useState<{ status: LinkStatus | 'validating'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const { updateResource, checkLinkHealth, addActivity, recordInteraction } = useResources();
  
  // 인스턴스를 메모이제이션하여 불필요한 재생성 방지
  const linkHealthService = useMemo(() => new LinkHealthService(), []);
  const ingestionSimulator = useMemo(() => new IngestionSimulator(), []);
  const executor = useMemo(() => new DevAgentExecutor(), []);
  
  const risk = useMemo(() => detectDangerousCommand(resource.command || ''), [resource.command]);
  const vulnFindings = useMemo(() => getVulnerabilityFindings(resource), [resource]);

  const trustScore = getTrustScore(resource);
  const trustLabel = getTrustLabel(trustScore);
  
  // MCP 리소스 확인 (태그나 URL에 'mcp' 포함)
  const isMCPResource = useMemo(() => {
    const hasMCPTag = resource.tags.some(tag => tag.toLowerCase().includes('mcp'));
    const hasMCPUrl = resource.url.toLowerCase().includes('mcp');
    return hasMCPTag || hasMCPUrl;
  }, [resource.tags, resource.url]);

  const handleRun = async () => {
    if (!resource.command) return;
    if (risk.risky) {
      setRunNote(`⚠️ 안전 확인 필요: ${risk.reasons.join(', ')}`);
      return;
    }
    setRunState('running');
    setRunNote('명령을 준비하고 있어요...');

    const output = await executor.execute(resource.command, { dryRun: true });
    setRunNote(output);
    setRunState('done');
    addActivity({
      id: `activity_${Date.now()}`,
      type: 'run',
      message: `명령 실행(모의): ${resource.command}`,
      timestamp: new Date().toISOString(),
      resourceId: resource.id,
    });
    recordInteraction(resource.id, 'run');
    setTimeout(() => {
      setRunState('idle');
      setRunNote(null);
    }, 3200);
  };

  const handleEditUrl = () => {
    setIsEditingUrl(true);
    setEditUrl(resource.url);
    setUrlValidationStatus(null);
  };

  const handleCancelEdit = () => {
    setIsEditingUrl(false);
    setEditUrl(resource.url);
    setUrlValidationStatus(null);
  };

  const handleValidateUrl = async (urlToValidate: string) => {
    if (!urlToValidate.trim()) {
      setUrlValidationStatus({
        status: 'broken',
        message: 'URL을 입력해주세요',
      });
      return;
    }

    try {
      new URL(urlToValidate);
    } catch {
      setUrlValidationStatus({
        status: 'broken',
        message: '올바른 URL 형식이 아닙니다',
      });
      return;
    }

    setUrlValidationStatus({ status: 'validating', message: '링크 확인 중...' });
    
    try {
      const status = await linkHealthService.checkLink(urlToValidate);
      if (status === 'active') {
        setUrlValidationStatus({
          status: 'active',
          message: '링크가 정상적으로 작동합니다',
        });
      } else {
        setUrlValidationStatus({
          status: 'broken',
          message: '링크에 접근할 수 없습니다',
        });
      }
    } catch (err) {
      setUrlValidationStatus({
        status: 'broken',
        message: '링크 확인 중 오류가 발생했습니다',
      });
    }
  };

  const handleSaveUrl = async () => {
    if (!editUrl.trim() || editUrl === resource.url) {
      setIsEditingUrl(false);
      return;
    }

    setSaving(true);
    try {
      // URL 검증
      let linkStatus: LinkStatus = 'idle';
      if (urlValidationStatus?.status === 'validating') {
        linkStatus = await linkHealthService.checkLink(editUrl);
      } else if (urlValidationStatus?.status === 'active') {
        linkStatus = 'active';
      } else if (urlValidationStatus?.status === 'broken') {
        linkStatus = 'broken';
      } else {
        linkStatus = await linkHealthService.checkLink(editUrl);
      }
      
      // URL이 변경되었거나 active 상태인 경우 메타 정보 업데이트
      let metadataUpdates: Partial<Resource> = {};
      if (editUrl !== resource.url || linkStatus === 'active') {
        try {
          // URL이 변경된 경우 또는 active 상태인 경우 메타 정보 업데이트
          const updatedMeta = await ingestionSimulator.updateMetadataForURL(editUrl, resource);
          metadataUpdates = {
            ...updatedMeta,
            // 메타 정보가 업데이트된 경우 lastFetchedAt 갱신
            meta: updatedMeta.meta ? {
              ...updatedMeta.meta,
              lastFetchedAt: new Date().toISOString(),
            } : resource.meta,
          };
        } catch (metaError) {
          // 개발 환경에서만 경고 출력
          if (import.meta.env.DEV) {
          console.warn('Metadata update failed, continuing with URL update:', metaError);
        }
          // 실패 시 기본 메타 정보만 업데이트
          metadataUpdates = {
            meta: {
              ...resource.meta,
              lastFetchedAt: new Date().toISOString(),
            },
          };
        }
      } else {
        // 링크 상태만 변경된 경우 메타 정보의 lastFetchedAt만 업데이트
        metadataUpdates = {
          meta: {
            ...resource.meta,
            lastFetchedAt: new Date().toISOString(),
          },
        };
      }
      
      // 리소스 업데이트 (URL, 링크 상태, 메타 정보)
      await updateResource(resource.id, {
        ...metadataUpdates,
        url: editUrl,
        linkStatus,
        lastCheckedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setIsEditingUrl(false);
      setUrlValidationStatus(null);
    } catch (error) {
      // 개발 환경에서만 에러 로그 출력
      if (import.meta.env.DEV) {
      console.error('Failed to update URL:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
            {resource.title}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded">
              <span>{CATEGORY_ICONS[RESOURCE_TYPE_TO_CATEGORY[resource.type]]}</span>
              <span>{CATEGORY_LABELS[RESOURCE_TYPE_TO_CATEGORY[resource.type]]}</span>
            </span>
            {isMCPResource && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded border border-purple-200 dark:border-purple-700">
                <span>🔗</span>
                <span>MCP</span>
              </span>
            )}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {RESOURCE_TYPE_LABELS[resource.type]}
            </span>
            <SourceBadge sourceType={resource.sourceType} />
            <StatusBadge status={resource.linkStatus} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 sm:gap-2 flex-shrink-0">
          {resource.stars && (
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
              <span className="hidden sm:inline">{formatNumber(resource.stars)}</span>
              <span className="sm:hidden">{formatNumber(resource.stars).length > 3 ? formatNumber(resource.stars).slice(0, -1) + 'k' : formatNumber(resource.stars)}</span>
            </div>
          )}
          <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border ${trustLabel.className}`}>
            <span className="hidden sm:inline">{trustLabel.label} · {trustScore}점</span>
            <span className="sm:hidden">{trustScore}</span>
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 line-clamp-2">
        {truncateText(resource.description, 120)}
      </p>

      {/* Platforms */}
      {resource.platforms.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
          {resource.platforms.map((platform) => (
            <span
              key={platform}
              className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
            >
              {platform}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Social Metrics */}
      {resource.socialMetrics && (
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{formatNumber(resource.socialMetrics.likes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="w-4 h-4" />
            <span>{formatNumber(resource.socialMetrics.shares)}</span>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">업데이트</p>
          <p>{formatDateLabel(resource.updatedAt || resource.createdAt)}</p>
        </div>
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200">링크 체크</p>
          <p>{formatDateLabel(resource.lastCheckedAt)}</p>
        </div>
        {resource.meta && (
          <>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-200">스냅샷</p>
              <p className="line-clamp-1">{resource.meta.title || resource.title || 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-200">상태/타입</p>
              <p>{resource.meta.statusCode || 200} · {resource.meta.contentType || 'text/html'}</p>
            </div>
          </>
        )}
      </div>

      {/* Command */}
      {resource.command && (
        <div className="mb-4">
          <CommandCopyButton command={resource.command} onCopied={() => recordInteraction(resource.id, 'copy')} />
        </div>
      )}

      {/* Auto workflow suggestion */}
      {resource.command && (
        <div className="mb-4 p-2.5 sm:p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1.5 sm:mb-2">자동 워크플로우</p>
          <ol className="list-decimal list-inside text-[10px] sm:text-xs text-gray-700 dark:text-gray-200 space-y-0.5 sm:space-y-1 break-words overflow-wrap-anywhere">
            <li className="break-words overflow-wrap-anywhere">설치: <code className="break-all">{resource.command}</code> 실행</li>
            <li className="break-words overflow-wrap-anywhere">설정: 공식 문서/README 확인 (<a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">{resource.url}</a>)</li>
            <li>검증: 링크 헬스 체크 후 샘플 명령 실행</li>
          </ol>
        </div>
      )}

      {(risk.risky || vulnFindings.length > 0) && (
        <div className="mb-4 p-2.5 sm:p-3 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-[10px] sm:text-xs">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>안전 경고</span>
          </div>
          {risk.risky && (
            <p className="mb-1">명령 확인 필요: {risk.reasons.join(', ')}</p>
          )}
          {vulnFindings.length > 0 && (
            <ul className="list-disc list-inside space-y-1">
              {vulnFindings.map((finding) => (
                <li key={finding.id}>
                  [{finding.severity.toUpperCase()}] {finding.summary}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Execution CTA */}
      {resource.command && (
        <div className="mb-4 p-2.5 sm:p-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100">명령어 미리보기</p>
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">터미널에 붙여넣기 전에 실행 흐름을 확인할 수 있습니다.</p>
            </div>
            <button
              onClick={handleRun}
              disabled={runState === 'running'}
              className="px-3 sm:px-4 py-2.5 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs sm:text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors touch-manipulation whitespace-nowrap"
            >
              {runState === 'running' ? '실행 중...' : '실행 시뮬레이션'}
            </button>
          </div>
          {runNote && (
            <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
              {runNote}
            </div>
          )}
        </div>
      )}

      {/* URL 편집 섹션 */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        {isEditingUrl ? (
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL 수정
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => {
                      setEditUrl(e.target.value);
                      setUrlValidationStatus(null);
                    }}
                    onBlur={() => editUrl !== resource.url && handleValidateUrl(editUrl)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 ${
                      urlValidationStatus?.status === 'active'
                        ? 'border-green-500 focus:ring-green-500'
                        : urlValidationStatus?.status === 'broken'
                        ? 'border-red-500 focus:ring-red-500'
                        : urlValidationStatus?.status === 'validating'
                        ? 'border-yellow-500 focus:ring-yellow-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                    }`}
                    disabled={saving}
                  />
                  {urlValidationStatus && (
                    <div
                      className={`mt-1 flex items-center gap-1 text-xs ${
                        urlValidationStatus.status === 'active'
                          ? 'text-green-600 dark:text-green-400'
                          : urlValidationStatus.status === 'broken'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`}
                    >
                      {urlValidationStatus.status === 'active' && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {urlValidationStatus.status === 'broken' && (
                        <XCircle className="w-3 h-3" />
                      )}
                      {urlValidationStatus.status === 'validating' && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                      <span>{urlValidationStatus.message}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSaveUrl}
                  disabled={saving || editUrl === resource.url || urlValidationStatus?.status === 'validating'}
                  className="px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 touch-manipulation"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-0 text-xs sm:text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 touch-manipulation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={async (e) => {
                  e.preventDefault();
                  
                  // 링크 상태 재측정
                  try {
                    const currentStatus = await linkHealthService.checkLink(resource.url);
                    
                    // 상태가 변경된 경우 업데이트
                    if (currentStatus !== resource.linkStatus) {
                      await updateResource(resource.id, {
                        linkStatus: currentStatus,
                        lastCheckedAt: new Date().toISOString(),
                      });
                    }
                    
                    // broken 링크인 경우 자동 수정 시도
                    if (currentStatus === 'broken') {
                      try {
                        const fixed = await linkHealthService.autoFixBrokenLink(resource);
                        if (fixed.linkStatus === 'fixed') {
                          await updateResource(resource.id, {
                            url: fixed.url,
                            linkStatus: fixed.linkStatus,
                            lastCheckedAt: fixed.lastCheckedAt,
                          });
                          // 수정된 URL로 새 창 열기
                          window.open(fixed.url, '_blank', 'noopener,noreferrer');
                          return;
                        }
                      } catch (fixError) {
                        // 자동 수정 실패 시 원본 URL로 시도
                        console.warn('Auto-fix failed:', fixError);
                      }
                    }
                    
                    // 정상 링크이거나 수정 실패한 경우 원본 URL로 열기
                    window.open(resource.url, '_blank', 'noopener,noreferrer');
                  } catch (error) {
                    // 오류 발생 시 원본 URL로 시도
                    console.warn('Link check failed:', error);
                    window.open(resource.url, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium min-h-[44px] sm:min-h-0 px-2 sm:px-0 touch-manipulation"
              >
                <span>자세히 보기</span>
                {isMCPResource && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-700">
                    <span>🔗</span>
                    <span>MCP</span>
                  </span>
                )}
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <button
                onClick={handleEditUrl}
                className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 min-h-[44px] sm:min-h-0 px-2 touch-manipulation"
                title="URL 수정"
              >
                <Edit2 className="w-3 h-3" />
                <span className="hidden sm:inline">URL 수정</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => checkLinkHealth(resource.id)}
                className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 min-h-[44px] sm:min-h-0 px-2 touch-manipulation"
                title="링크 상태 재확인"
              >
                <span className="hidden sm:inline">상태 확인</span>
                <span className="sm:hidden">확인</span>
              </button>
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(resource)}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 min-h-[44px] sm:min-h-0 px-2 touch-manipulation"
                >
                  상세
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
