/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { Resource } from '../../utils/types';

/**
 * 리소스의 URL과 command 일치성 검증 및 자동 수정
 */
export class ResourceValidator {
  /**
   * 리소스의 URL과 command가 일치하는지 검증하고 수정
   */
  validateAndFixResource(resource: Resource): Resource {
    let fixedResource = { ...resource };
    
    // 1. command에 URL이 포함된 경우 일치성 확인
    if (fixedResource.command && fixedResource.url) {
      const urlInCommand = this.extractURLFromCommand(fixedResource.command);
      
      if (urlInCommand) {
        // command의 URL과 resource.url이 다르면 수정
        if (urlInCommand !== fixedResource.url) {
          // resource.url을 기준으로 command 업데이트
          fixedResource.command = fixedResource.command.replace(urlInCommand, fixedResource.url);
        }
      } else {
        // command에 URL이 없고 resource.url이 있는 경우 추가
        if (fixedResource.command.includes('gemini extensions install')) {
          // gemini extensions install 명령어인 경우 URL 추가
          if (!fixedResource.command.includes(fixedResource.url)) {
            fixedResource.command = `gemini extensions install ${fixedResource.url}`;
          }
        }
      }
    }
    
    // 2. URL 정규화
    fixedResource.url = this.normalizeURL(fixedResource.url);
    
    // 3. command 정규화
    if (fixedResource.command) {
      fixedResource.command = this.normalizeCommand(fixedResource.command, fixedResource.url);
    }
    
    return fixedResource;
  }

  /**
   * command에서 URL 추출
   */
  private extractURLFromCommand(command: string): string | null {
    const urlPattern = /https?:\/\/[^\s\)]+/g;
    const matches = command.match(urlPattern);
    return matches ? matches[0] : null;
  }

  /**
   * URL 정규화
   */
  private normalizeURL(url: string): string {
    try {
      const urlObj = new URL(url);
      
      // GitHub URL 정규화
      if (urlObj.hostname.includes('github.com')) {
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
              (url.includes('mcp') || url.includes('modelcontextprotocol'))) {
            return url.replace('/tree/main/src/', '/tree/main/src/providers/');
          }
        }
        
        // http:// -> https://
        if (urlObj.protocol === 'http:') {
          return url.replace('http://', 'https://');
        }
        
        // www. 제거
        if (urlObj.hostname.startsWith('www.')) {
          return url.replace('www.', '');
        }
      }
      
      return url;
    } catch {
      return url;
    }
  }

  /**
   * command 정규화
   */
  private normalizeCommand(command: string, url: string): string {
    if (!command || !url) return command;
    
    try {
      const urlObj = new URL(url);
      
      // GitHub URL인 경우 command 정규화
      if (urlObj.hostname.includes('github.com')) {
        // command에 잘못된 URL이 포함된 경우 수정
        const urlInCommand = this.extractURLFromCommand(command);
        if (urlInCommand && urlInCommand !== url) {
          // URL이 다르면 올바른 URL로 교체
          command = command.replace(urlInCommand, url);
        }
        
        // gemini extensions install 명령어 정규화
        if (command.includes('gemini extensions install')) {
          // URL이 command에 없으면 추가
          if (!command.includes(url)) {
            command = `gemini extensions install ${url}`;
          }
        }
      }
      
      return command;
    } catch {
      return command;
    }
  }

  /**
   * 여러 리소스를 일괄 검증 및 수정
   */
  validateAndFixResources(resources: Resource[]): Resource[] {
    return resources.map(resource => this.validateAndFixResource(resource));
  }
}

