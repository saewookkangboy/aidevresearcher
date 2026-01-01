/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource } from '../../utils/types';

/**
 * Extension 카테고리 리소스의 링크 및 내용 일치성 검증 및 수정
 */
export class ExtensionLinkFixer {
  /**
   * Extension 리소스의 URL과 내용 일치성 검증 및 수정
   */
  fixExtensionResource(resource: Resource): Resource {
    let fixed = { ...resource };
    
    // VS Code Extension 처리
    if (fixed.type === 'VSCODE_EXT') {
      fixed = this.fixVSCodeExtension(fixed);
    }
    
    // CLI Extension 처리
    if (fixed.type === 'CLI_EXTENSION') {
      fixed = this.fixCLIExtension(fixed);
    }
    
    return fixed;
  }

  /**
   * VS Code Extension 링크 수정
   */
  private fixVSCodeExtension(resource: Resource): Resource {
    let fixed = { ...resource };
    
    // VS Code Marketplace URL 패턴 확인
    if (fixed.url) {
      // marketplace.visualstudio.com URL 정규화
      if (fixed.url.includes('marketplace.visualstudio.com')) {
        // 이미 올바른 형식
        // command도 일치시키기
        if (fixed.command && !fixed.command.includes('code --install-extension')) {
          const extensionId = this.extractExtensionId(fixed.url);
          if (extensionId) {
            fixed.command = `code --install-extension ${extensionId}`;
          }
        }
        return fixed;
      }
      
      // GitHub URL인 경우 - 특정 확장 프로그램은 Marketplace URL로 변환
      if (fixed.url.includes('github.com')) {
        // GitHub Copilot은 Marketplace URL 사용
        if (fixed.url.includes('github.com/github/copilot') || 
            fixed.title.toLowerCase().includes('copilot') && !fixed.title.toLowerCase().includes('codea11y')) {
          fixed.url = 'https://marketplace.visualstudio.com/items?itemName=GitHub.copilot';
          fixed.command = 'code --install-extension GitHub.copilot';
          fixed.source = 'VS Code Marketplace';
          fixed.sourceType = 'OFFICIAL';
          return fixed;
        }
        
        // Continue는 Marketplace URL 사용
        if (fixed.url.includes('continuedev/continue') || 
            (fixed.title.toLowerCase().includes('continue') && !fixed.url.includes('cursor'))) {
          fixed.url = 'https://marketplace.visualstudio.com/items?itemName=Continue.continue';
          fixed.command = 'code --install-extension Continue.continue';
          fixed.source = 'VS Code Marketplace';
          fixed.sourceType = 'OFFICIAL';
          return fixed;
        }
        
        // Cursor는 공식 사이트 URL 사용
        if (fixed.url.includes('getcursor/cursor') || 
            (fixed.title.toLowerCase().includes('cursor') && !fixed.title.toLowerCase().includes('continue'))) {
          fixed.url = 'https://cursor.sh';
          fixed.command = 'Download from cursor.sh';
          fixed.source = 'Official';
          fixed.sourceType = 'OFFICIAL';
          return fixed;
        }
        
        // 기타 GitHub URL은 그대로 유지하되 command 확인
        const marketplaceUrl = this.convertGitHubToMarketplace(fixed.url, fixed.title);
        if (marketplaceUrl && !fixed.url.includes('cursor.sh')) {
          // Marketplace URL이 있으면 사용
          fixed.url = marketplaceUrl;
        }
      }
      
      // 잘못된 URL 패턴 수정
      if (fixed.url.includes('vscode-extension') || fixed.url.includes('vscode-ext')) {
        // GitHub 리포지토리에서 확장 프로그램 이름 추출
        const repoName = this.extractRepoName(fixed.url);
        if (repoName) {
          fixed.url = `https://marketplace.visualstudio.com/items?itemName=${repoName}`;
        }
      }
    }
    
    // command 수정
    if (fixed.command && fixed.url) {
      // command에 URL이 포함된 경우 일치시키기
      if (fixed.command.includes('code --install-extension')) {
        const extensionId = this.extractExtensionId(fixed.url);
        if (extensionId) {
          fixed.command = `code --install-extension ${extensionId}`;
        }
      } else if (fixed.url.includes('marketplace.visualstudio.com')) {
        // Marketplace URL이 있는데 command가 없으면 추가
        const extensionId = this.extractExtensionId(fixed.url);
        if (extensionId) {
          fixed.command = `code --install-extension ${extensionId}`;
        }
      }
    }
    
    return fixed;
  }

  /**
   * CLI Extension 링크 수정
   */
  private fixCLIExtension(resource: Resource): Resource {
    let fixed = { ...resource };
    
    // Gemini CLI Extension 처리
    if (fixed.command && fixed.command.includes('gemini extensions install')) {
      // command에서 URL 추출
      const urlInCommand = fixed.command.match(/https?:\/\/[^\s\)]+/)?.[0];
      
      if (urlInCommand) {
        // URL 정규화 먼저 수행
        let normalizedUrl = this.normalizeGitHubURL(urlInCommand);
        
        // command의 URL과 resource.url이 다르면 resource.url을 기준으로 수정
        if (fixed.url && fixed.url !== normalizedUrl) {
          // resource.url을 기준으로 command 업데이트
          fixed.command = fixed.command.replace(urlInCommand, fixed.url);
          normalizedUrl = fixed.url;
        } else if (!fixed.url) {
          // URL이 없으면 command에서 추출한 URL 사용
          fixed.url = normalizedUrl;
        } else {
          // 둘 다 있으면 정규화된 URL로 통일
          fixed.url = normalizedUrl;
          fixed.command = fixed.command.replace(urlInCommand, normalizedUrl);
        }
      } else if (fixed.url) {
        // command에 URL이 없고 resource.url이 있으면 command에 추가
        if (!fixed.command.includes(fixed.url)) {
          fixed.command = `gemini extensions install ${fixed.url}`;
        }
      }
    }
    
    // GitHub URL 정규화
    if (fixed.url && fixed.url.includes('github.com')) {
      const normalizedUrl = this.normalizeGitHubURL(fixed.url);
      if (normalizedUrl !== fixed.url) {
        fixed.url = normalizedUrl;
        // command도 함께 수정
        if (fixed.command && fixed.command.includes(fixed.url)) {
          // 이미 command에 포함된 경우는 변경하지 않음
        } else if (fixed.command && fixed.command.includes('gemini extensions install')) {
          // command의 URL도 정규화
          const urlInCommand = fixed.command.match(/https?:\/\/[^\s\)]+/)?.[0];
          if (urlInCommand) {
            fixed.command = fixed.command.replace(urlInCommand, normalizedUrl);
          }
        }
      }
    }
    
    // npm 패키지 URL 처리
    if (fixed.url && fixed.url.includes('npmjs.com')) {
      // npm 패키지 이름 추출
      const packageName = this.extractNpmPackageName(fixed.url);
      if (packageName && fixed.command && !fixed.command.includes(packageName)) {
        fixed.command = `npm install -g ${packageName}`;
      }
    }
    
    return fixed;
  }

  /**
   * GitHub URL 정규화 (MCP 서버 경로 수정 등)
   */
  private normalizeGitHubURL(url: string): string {
    // modelcontextprotocol/servers 특별 처리
    // 실제 구조: src/* 경로가 존재하지 않음 (404 에러 메시지 확인)
    // 모든 경로를 리포지토리 루트로 변경
    if (url.includes('modelcontextprotocol/servers')) {
      // 어떤 경로든 리포지토리 루트로 변경
      return 'https://github.com/modelcontextprotocol/servers';
    } else {
      // 일반 MCP 서버: /tree/main/src/ -> /tree/main/src/providers/
      if (url.includes('/tree/main/src/') && 
          !url.includes('/tree/main/src/providers/') &&
          url.includes('mcp')) {
        return url.replace('/tree/main/src/', '/tree/main/src/providers/');
      }
    }
    
    return url;
  }


  /**
   * GitHub URL에서 리포지토리 이름 추출
   */
  private extractRepoName(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        return pathParts[1];
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * GitHub URL을 VS Code Marketplace URL로 변환
   */
  private convertGitHubToMarketplace(githubUrl: string, title?: string): string | null {
    // GitHub 리포지토리에서 확장 프로그램 이름 추출
    const repoName = this.extractRepoName(githubUrl);
    if (!repoName) return null;
    
    // title에서 확장 프로그램 ID 추출 시도
    if (title) {
      const extensionId = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return `https://marketplace.visualstudio.com/items?itemName=${extensionId}`;
    }
    
    return null;
  }

  /**
   * Marketplace URL에서 확장 프로그램 ID 추출
   */
  private extractExtensionId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const itemName = urlObj.searchParams.get('itemName');
      return itemName || null;
    } catch {
      return null;
    }
  }

  /**
   * npm URL에서 패키지 이름 추출
   */
  private extractNpmPackageName(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 1 && pathParts[0] === 'package') {
        return pathParts[1] || null;
      }
      if (pathParts.length >= 1) {
        return pathParts[0];
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * 여러 Extension 리소스를 일괄 수정
   */
  fixExtensionResources(resources: Resource[]): Resource[] {
    return resources.map(resource => {
      // Extension 카테고리 리소스만 수정
      if (resource.type === 'VSCODE_EXT' || resource.type === 'CLI_EXTENSION') {
        return this.fixExtensionResource(resource);
      }
      return resource;
    });
  }
}

