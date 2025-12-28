/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

export interface FeedEntry {
  title: string;
  url: string;
  description?: string;
  updated?: string;
  thumbnail?: string;
}

export class FeedParserService {
  async parseFeed(feedUrl: string): Promise<FeedEntry[]> {
    try {
      const response = await fetch(feedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }

      const xmlText = await response.text();
      return this.parseAtomFeed(xmlText);
    } catch (error) {
      throw new Error(`Failed to parse feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseAtomFeed(xmlText: string): FeedEntry[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // 파싱 오류 체크
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }

    const entries: FeedEntry[] = [];
    const entryElements = xmlDoc.querySelectorAll('entry');

    entryElements.forEach((entry) => {
      try {
        const title = entry.querySelector('title')?.textContent?.trim() || '';
        const content = entry.querySelector('content')?.textContent || '';
        
        // GitHub 리포지토리 URL 찾기
        // <link rel="related" type="text/html" href="..."/>
        const relatedLink = entry.querySelector('link[rel="related"]')?.getAttribute('href');
        const alternateLink = entry.querySelector('link[rel="alternate"]')?.getAttribute('href');
        const defaultLink = entry.querySelector('link')?.getAttribute('href');
        
        const repoUrl = relatedLink || alternateLink || defaultLink;
        
        if (!repoUrl) {
          return; // URL이 없으면 건너뛰기
        }

        // GitHub URL만 처리 (다른 URL은 필터링)
        if (!repoUrl.includes('github.com')) {
          return;
        }

        // description 추출 (content에서 HTML 태그 제거)
        let description = '';
        if (content) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = content;
          description = tempDiv.textContent || tempDiv.innerText || '';
          // 첫 번째 문단만 사용
          description = description.split('\n')[0].trim();
        }

        // thumbnail 찾기 (네임스페이스 처리)
        const thumbnailElement = entry.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail').item(0) ||
                                entry.querySelector('thumbnail');
        const thumbnail = thumbnailElement?.getAttribute('url') || 
                         entry.querySelector('[url]')?.getAttribute('url') || undefined;

        const updated = entry.querySelector('updated')?.textContent?.trim() || undefined;

        entries.push({
          title,
          url: repoUrl,
          description: description || undefined,
          updated,
          thumbnail,
        });
      } catch (error) {
        // 개별 entry 파싱 오류는 무시하고 계속 진행
        console.warn('Failed to parse feed entry:', error);
      }
    });

    return entries;
  }

  /**
   * Feed URL에서 GitHub 리포지토리 URL만 추출
   */
  async extractGitHubUrls(feedUrl: string): Promise<string[]> {
    const entries = await this.parseFeed(feedUrl);
    return entries
      .map(entry => entry.url)
      .filter(url => url.includes('github.com'));
  }
}

