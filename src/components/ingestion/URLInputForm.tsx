/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useURLIngestion } from '../../hooks/useURLIngestion';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { SuccessMessage } from '../common/SuccessMessage';
import { Plus, CheckCircle2, XCircle, AlertCircle, Loader2, Rss } from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';
import { extractKeywords, inferCategoryFromQuery, inferResourceTypeFromQuery } from '../../utils/nlpMatcher';
import { LinkHealthService } from '../../services/api/linkHealthService';
import { LinkStatus } from '../../utils/types';

export function URLInputForm() {
  const [url, setUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [goal, setGoal] = useState('');
  const [domain, setDomain] = useState('');
  const [stack, setStack] = useState('');
  const [intentSuccess, setIntentSuccess] = useState(false);
  const [urlValidationStatus, setUrlValidationStatus] = useState<{ status: LinkStatus | 'idle' | 'validating'; message: string } | null>(null);
  const [feedUrl, setFeedUrl] = useState('https://tom-doerr.github.io/repo_posts/feed.xml');
  const [feedSuccess, setFeedSuccess] = useState(false);
  const { ingest, ingestFeed, loading, error, validating, feedProgress } = useURLIngestion();
  const { searchResources } = useResources();
  const linkHealthService = new LinkHealthService();

  // URL 실시간 검증
  const isCancelledRef = useRef(false);
  useEffect(() => {
    isCancelledRef.current = false;
    const validateUrl = async () => {
      const trimmedUrl = url.trim();
      
      if (!trimmedUrl) {
        if (!isCancelledRef.current) {
          setUrlValidationStatus(null);
        }
        return;
      }

      // 기본 URL 형식 검증
      try {
        new URL(trimmedUrl);
      } catch {
        if (!isCancelledRef.current) {
          setUrlValidationStatus({
            status: 'broken',
            message: '올바른 URL 형식이 아닙니다',
          });
        }
        return;
      }

      // URL 형식이 올바르면 실제 접근 가능 여부 확인
      if (!isCancelledRef.current) {
        setUrlValidationStatus({ status: 'validating', message: '링크 확인 중...' });
      }
      
      try {
        const status = await linkHealthService.checkLink(trimmedUrl);
        if (!isCancelledRef.current) {
          if (status === 'active') {
            setUrlValidationStatus({
              status: 'active',
              message: '링크가 정상적으로 작동합니다',
            });
          } else {
            setUrlValidationStatus({
              status: 'broken',
              message: '링크에 접근할 수 없습니다 (404 또는 오류)',
            });
          }
        }
      } catch (err) {
        if (!isCancelledRef.current) {
          setUrlValidationStatus({
            status: 'broken',
            message: '링크 확인 중 오류가 발생했습니다',
          });
        }
      }
    };

    // 디바운스: 사용자가 입력을 멈춘 후 1초 뒤에 검증
    const timeoutId = setTimeout(validateUrl, 1000);
    return () => {
      isCancelledRef.current = true;
      clearTimeout(timeoutId);
    };
  }, [url]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    if (!url.trim()) return;

    // 검증이 완료되지 않았거나 broken 상태인 경우 경고
    if (urlValidationStatus?.status === 'validating') {
      setUrlValidationStatus({
        status: 'broken',
        message: '링크 확인이 완료될 때까지 기다려주세요',
      });
      return;
    }

    const resource = await ingest(url);
    if (resource) {
      setUrl('');
      setUrlValidationStatus(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleIntentSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIntentSuccess(false);

    const combinedText = [goal, domain, stack].filter(Boolean).join(' ').trim();
    if (!combinedText) return;

    const categories = inferCategoryFromQuery(combinedText);
    const types = inferResourceTypeFromQuery(combinedText);
    const keywords = extractKeywords(combinedText);
    const platformCandidates = stack
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
    const mergedTags = Array.from(new Set([...keywords, ...platformCandidates.map(p => p.toLowerCase())]));

    searchResources({
      text: combinedText,
      category: categories.length ? categories : undefined,
      type: types.length ? types : undefined,
      tags: mergedTags.length ? mergedTags : undefined,
      platforms: platformCandidates.length ? platformCandidates : undefined,
    });

    setIntentSuccess(true);
    setTimeout(() => setIntentSuccess(false), 3500);
  };

  const handleFeedSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedSuccess(false);
    
    if (!feedUrl.trim()) return;

    const resources = await ingestFeed(feedUrl);
    if (resources.length > 0) {
      setFeedUrl('');
      setFeedSuccess(true);
      setTimeout(() => setFeedSuccess(false), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          목표 기반 추천
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          하고 싶은 일을 간단히 적으면 자동으로 필요한 도구를 찾아드립니다. 기술 용어를 몰라도 괜찮아요!
        </p>
        <form onSubmit={handleIntentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                무엇을 하고 싶나요?
              </label>
              <input
                id="goal"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="예: 내 서비스 SEO 올리고, AI 챗봇 붙이기"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                서비스/도메인 (옵션)
              </label>
              <input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="예: https://myproduct.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="stack" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              선호 스택/도구 (콤마로 구분, 옵션)
            </label>
            <input
              id="stack"
              type="text"
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="예: Python, React, LangChain"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              입력 내용으로 검색어, 카테고리, 태그, 플랫폼 필터가 자동 적용됩니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
            >
              맞춤 추천 적용
            </button>
            {intentSuccess && (
              <span className="text-sm text-green-600 dark:text-green-400">
                추천이 적용되었습니다. 결과를 확인하세요.
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          새 도구 추가하기
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              도구 URL (GitHub, PyPI, 또는 문서 페이지)
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/example/repo"
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    urlValidationStatus?.status === 'active'
                      ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                      : urlValidationStatus?.status === 'broken'
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : urlValidationStatus?.status === 'validating'
                      ? 'border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  disabled={loading}
                  aria-label="리소스 URL 입력"
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
                type="submit"
                disabled={loading || !url.trim() || urlValidationStatus?.status === 'validating' || urlValidationStatus?.status === 'broken'}
                className="px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>{validating ? '링크 확인 중...' : '분석 중...'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>추가</span>
                  </>
                )}
              </button>
            </div>
            {urlValidationStatus?.status === 'broken' && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-700 dark:text-red-300">
                    <p className="font-medium mb-1">링크에 접근할 수 없습니다</p>
                    <p>URL이 올바른지 확인하거나, 나중에 수정할 수 있습니다.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <ErrorMessage
              message={error}
              variant="error"
            />
          )}

          {success && (
            <SuccessMessage
              message="도구가 성공적으로 추가되었습니다!"
              onDismiss={() => setSuccess(false)}
            />
          )}
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Feed에서 도구 일괄 추가
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          RSS/Atom Feed URL을 입력하면 Feed에 포함된 GitHub 리포지토리를 자동으로 수집합니다.
        </p>
        <form onSubmit={handleFeedSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Feed URL (RSS/Atom)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="feedUrl"
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://tom-doerr.github.io/repo_posts/feed.xml"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
                aria-label="Feed URL 입력"
              />
              <button
                type="submit"
                disabled={loading || !feedUrl.trim()}
                className="px-6 py-2 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>
                      {feedProgress 
                        ? `처리 중... ${feedProgress.current}/${feedProgress.total}`
                        : '분석 중...'
                      }
                    </span>
                  </>
                ) : (
                  <>
                    <Rss className="w-5 h-5" />
                    <span>Feed 수집</span>
                  </>
                )}
              </button>
            </div>
            {feedProgress && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(feedProgress.current / feedProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {feedProgress.current} / {feedProgress.total} 리소스 처리 중...
                </p>
              </div>
            )}
          </div>

          {error && (
            <ErrorMessage
              message={error}
              variant="error"
            />
          )}

          {feedSuccess && (
            <SuccessMessage
              message="Feed에서 도구가 성공적으로 추가되었습니다!"
              onDismiss={() => setFeedSuccess(false)}
            />
          )}
        </form>
      </div>
    </div>
  );
}
