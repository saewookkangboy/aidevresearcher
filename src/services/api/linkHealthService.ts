/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource, LinkStatus } from '../../utils/types';

export class LinkHealthService {
  async checkLink(url: string): Promise<LinkStatus> {
    try {
      // URL 형식 먼저 검증
      try {
        new URL(url);
      } catch {
        return 'broken';
      }

      // CORS 제한을 우회하기 위해 프록시 서비스 사용 시도
      // 실제 프로덕션에서는 백엔드 API를 통해 검증하는 것을 권장
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

      try {
        // 프록시를 통한 HEAD 요청 시도
        const response = await fetch(proxyUrl, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
        });
        
        clearTimeout(timeoutId);
        
        // HTTP 상태 코드 확인
        if (response.ok || response.status === 200 || response.status === 301 || response.status === 302) {
          return 'active';
        } else if (response.status === 429) {
          // Rate limit 오류는 조용히 처리하고 직접 요청으로 폴백
          return await this.checkLinkDirect(url);
        } else if (response.status >= 400) {
          // 404, 403 등은 broken
          return 'broken';
        }
        
        return 'active';
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // 타임아웃
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return 'broken';
        }
        
        // 네트워크 오류나 CORS 오류는 조용히 처리하고 직접 요청으로 폴백
        // 429 오류도 여기서 처리됨
        return await this.checkLinkDirect(url);
      }
    } catch (error) {
      // 에러를 조용히 처리 (콘솔에 출력하지 않음)
      return 'broken';
    }
  }

  private async checkLinkDirect(url: string): Promise<LinkStatus> {
    // 직접 요청 시도 (CORS 제한으로 실패할 수 있음)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      // 이미지나 파비콘 등 작은 리소스를 요청하여 확인
      // 또는 HEAD 요청 시도
      await fetch(url, {
        method: 'GET',
        mode: 'no-cors', // CORS 우회 (하지만 응답 상태 확인 불가)
        signal: controller.signal,
        cache: 'no-cache',
      });
      
      clearTimeout(timeoutId);
      // no-cors 모드에서는 상태를 정확히 알 수 없지만,
      // 요청이 전송되었다면 일단 active로 간주
      return 'active';
    } catch (error) {
      clearTimeout(timeoutId);
      
      // 네트워크 오류나 타임아웃은 broken으로 처리
      // 에러를 조용히 처리 (콘솔에 출력하지 않음)
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('Failed to fetch'))) {
        return 'broken';
      }
      
      // 다른 오류는 일단 active로 간주 (CORS 제한일 수 있음)
      return 'active';
    }
  }

  async findAlternativeURL(brokenUrl: string): Promise<string | null> {
    // AI가 대체 가능한 최신 URL 찾기 시뮬레이션
    await this.simulateDelay(1000);

    // GitHub 리포지토리인 경우 새 URL 생성 시뮬레이션
    if (brokenUrl.includes('github.com')) {
      const parts = brokenUrl.split('/');
      if (parts.length >= 3) {
        // 같은 리포지토리의 다른 브랜치나 새 URL 시뮬레이션
        return `https://github.com/${parts[3]}/${parts[4]}`;
      }
    }

    // 대체 URL을 찾지 못한 경우
    return null;
  }

  async autoFixBrokenLink(resource: Resource): Promise<Resource> {
    const alternativeUrl = await this.findAlternativeURL(resource.url);
    
    if (alternativeUrl) {
      const newStatus = await this.checkLink(alternativeUrl);
      if (newStatus === 'active') {
        return {
          ...resource,
          url: alternativeUrl,
          linkStatus: 'fixed',
          updatedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
        };
      }
    }

    return {
      ...resource,
      linkStatus: 'broken',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

