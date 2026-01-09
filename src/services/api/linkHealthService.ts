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

      // 개발 환경에서도 실제 체크 수행 (404 오류 감지를 위해)
      // 프록시 서비스를 통해 실제 HTTP 상태 확인
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

      try {
        // 프록시를 통한 GET 요청 시도 (HEAD는 allorigins.win에서 지원하지 않을 수 있음)
        const response = await fetch(proxyUrl, {
          method: 'GET',
          signal: controller.signal,
          redirect: 'follow',
        });
        
        clearTimeout(timeoutId);
        
        // allorigins.win은 항상 200을 반환하므로 JSON 응답을 파싱하여 실제 HTTP 상태 확인
        try {
          const data = await response.json();
          
          // allorigins.win 응답 구조: { status: { http_code: number, ... }, contents: string, ... }
          // 실제 HTTP 상태 코드 확인
          if (data.status?.http_code && data.status.http_code >= 400) {
            return 'broken';
          }
          
          // 응답 본문 확인 (404 오류 메시지 확인)
          const content = data.contents || '';
          if (content.includes('404') || content.includes('Not Found') || content.includes('Page not found') || content.includes('404 Not Found')) {
            return 'broken';
          }
          
          // http_code가 없거나 200대인 경우 active
          return 'active';
        } catch (parseError) {
          // JSON 파싱 실패 시 response.status로 fallback
          if (response.status >= 400) {
            return 'broken';
          }
          return 'active';
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // 타임아웃 또는 네트워크 오류는 직접 요청으로 폴백
        return await this.checkLinkDirect(url);
      }
    } catch (error) {
      // 에러를 조용히 처리
      return 'broken';
    }
  }

  private async checkLinkDirect(_url: string): Promise<LinkStatus> {
    // 직접 요청은 프록시 실패 시에만 사용
    // no-cors 모드는 응답 상태를 확인할 수 없으므로 사용하지 않음
    // 직접 요청은 CORS 제한으로 인해 상태를 확인할 수 없으므로
    // 프록시가 실패한 경우 broken으로 처리
    return 'broken';
  }

  async findAlternativeURL(brokenUrl: string): Promise<string | null> {
    // AI가 대체 가능한 최신 URL 찾기 시뮬레이션
    await this.simulateDelay(1000);

    try {
      const urlObj = new URL(brokenUrl);
      
      // GitHub URL 처리
      if (urlObj.hostname.includes('github.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        // modelcontextprotocol/servers 특별 처리
        // 실제 구조: src/* 경로가 존재하지 않음 (404 에러 메시지 확인)
        // 모든 경로를 리포지토리 루트로 변경
        if (brokenUrl.includes('modelcontextprotocol/servers')) {
          // 어떤 경로든 리포지토리 루트로 리다이렉트
          return 'https://github.com/modelcontextprotocol/servers';
        }
        
        // 1. /tree/main/src/ 경로를 /tree/main/src/providers/로 수정 (일반 MCP 서버)
        if (brokenUrl.includes('/tree/main/src/') && !brokenUrl.includes('/tree/main/src/providers/')) {
          const fixedUrl = brokenUrl.replace('/tree/main/src/', '/tree/main/src/providers/');
          return fixedUrl;
        }
        
        // 2. /tree/main/src/providers/ 경로가 404인 경우 리포지토리 루트로 변경
        if (brokenUrl.includes('/tree/main/src/providers/')) {
          // 리포지토리 루트 URL 생성: https://github.com/owner/repo
          if (pathParts.length >= 2) {
            return `https://github.com/${pathParts[0]}/${pathParts[1]}`;
          }
        }
        
        // 3. 깊은 경로가 404인 경우 상위 경로로 시도
        if (pathParts.length > 2) {
          // 리포지토리 루트로 시도
          return `https://github.com/${pathParts[0]}/${pathParts[1]}`;
        }
      }
      
      // 4. example.com 또는 잘못된 경로 처리
      if (brokenUrl.includes('example.com') || brokenUrl.includes('example/')) {
        return 'https://github.com/langchain-ai/langchain';
      }
      
      // 일반적인 URL 패턴 수정
      // http:// -> https://
      if (brokenUrl.startsWith('http://')) {
        return brokenUrl.replace('http://', 'https://');
      }
      
    } catch (error) {
      // URL 파싱 실패 시 원본 반환하지 않음
      return null;
    }

    // 대체 URL을 찾지 못한 경우
    return null;
  }

  async autoFixBrokenLink(resource: Resource): Promise<Resource> {
    // 여러 대체 URL 시도
    const alternativeUrls = await this.findMultipleAlternatives(resource.url, resource);
    
    for (const alternativeUrl of alternativeUrls) {
      if (!alternativeUrl) continue;
      
      const newStatus = await this.checkLink(alternativeUrl);
      if (newStatus === 'active') {
        // 메타 정보도 업데이트
        const fixedResource = {
          ...resource,
          url: alternativeUrl,
          linkStatus: 'fixed' as LinkStatus,
          updatedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
        };
        
        // command도 URL과 일치하도록 수정
        if (resource.command && resource.command.includes(resource.url)) {
          fixedResource.command = resource.command.replace(resource.url, alternativeUrl);
        }
        
        return fixedResource;
      }
    }

    return {
      ...resource,
      linkStatus: 'broken',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  private async findMultipleAlternatives(brokenUrl: string, resource?: Resource): Promise<string[]> {
    const alternatives: string[] = [];
    
    try {
      const urlObj = new URL(brokenUrl);
      
      if (urlObj.hostname.includes('github.com')) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        
        // modelcontextprotocol/servers 특별 처리
        // 실제 구조: src/* 경로가 존재하지 않음 (404 에러 메시지 확인)
        // 모든 경로를 리포지토리 루트로 변경
        if (brokenUrl.includes('modelcontextprotocol/servers')) {
          // 어떤 경로든 리포지토리 루트로 리다이렉트
          alternatives.push('https://github.com/modelcontextprotocol/servers');
        } else {
          // 일반 GitHub URL 처리
          // 1. /tree/main/src/ -> /tree/main/src/providers/
          if (brokenUrl.includes('/tree/main/src/') && !brokenUrl.includes('/tree/main/src/providers/')) {
            alternatives.push(brokenUrl.replace('/tree/main/src/', '/tree/main/src/providers/'));
          }
          
          // 2. 리포지토리 루트로 시도
          if (pathParts.length >= 2) {
            alternatives.push(`https://github.com/${pathParts[0]}/${pathParts[1]}`);
          }
          
          // 3. /tree/main/ 제거하고 리포지토리 루트로
          if (brokenUrl.includes('/tree/main/')) {
            const repoRoot = `https://github.com/${pathParts[0]}/${pathParts[1]}`;
            if (!alternatives.includes(repoRoot)) {
              alternatives.push(repoRoot);
            }
          }
          
          // 4. /blob/ -> /tree/ 로 변경
          if (brokenUrl.includes('/blob/')) {
            alternatives.push(brokenUrl.replace('/blob/', '/tree/'));
          }
        }
        
        // 5. Extension 리소스 특별 처리
        if (resource && (resource.type === 'VSCODE_EXT' || resource.type === 'CLI_EXTENSION')) {
          // command에서 URL 추출 시도
          if (resource.command) {
            const urlInCommand = resource.command.match(/https?:\/\/[^\s\)]+/)?.[0];
            if (urlInCommand && urlInCommand !== brokenUrl && !alternatives.includes(urlInCommand)) {
              alternatives.push(urlInCommand);
            }
          }
          
          // VS Code Extension의 경우 Marketplace URL 시도
          if (resource.type === 'VSCODE_EXT' && pathParts.length >= 2) {
            const repoName = pathParts[1];
            const marketplaceUrl = `https://marketplace.visualstudio.com/items?itemName=${repoName}`;
            alternatives.push(marketplaceUrl);
          }
        }
      }
      
      // 6. 기본 대체 URL 찾기
      const basicAlternative = await this.findAlternativeURL(brokenUrl);
      if (basicAlternative && !alternatives.includes(basicAlternative)) {
        alternatives.push(basicAlternative);
      }
      
    } catch (error) {
      // URL 파싱 실패 시 기본 대체만 시도
      const basicAlternative = await this.findAlternativeURL(brokenUrl);
      if (basicAlternative) {
        alternatives.push(basicAlternative);
      }
    }
    
    return alternatives;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
