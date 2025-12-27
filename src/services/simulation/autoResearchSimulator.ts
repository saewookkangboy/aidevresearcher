/**
 * Copyright (c) 2025 Park Chunghyo
 * 
 * This software was developed with assistance from Cursor AI and Codex.
 */

import { AutoResearchStatus } from '../../utils/types';
import { AUTO_RESEARCH_INTERVAL } from '../../utils/constants';

export class AutoResearchSimulator {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private status: AutoResearchStatus = {
    isActive: false,
    platform: null,
    lastScanTime: null,
    currentQuery: null,
    itemsFound: 0,
  };
  private callbacks: ((status: AutoResearchStatus) => void)[] = [];

  start(onUpdate: (status: AutoResearchStatus) => void) {
    if (this.intervalId) return;

    this.callbacks.push(onUpdate);
    this.status.isActive = true;

    // 즉시 첫 스캔 실행
    this.performScan();

    // 주기적 스캔
    this.intervalId = setInterval(() => {
      this.performScan();
    }, AUTO_RESEARCH_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.status.isActive = false;
    this.status.platform = null;
    this.status.currentQuery = null;
    this.notifyCallbacks();
  }

  getStatus(): AutoResearchStatus {
    return { ...this.status };
  }

  private async performScan() {
    const platforms: Array<'X' | 'THREADS' | 'REDDIT'> = ['X', 'THREADS', 'REDDIT'];
    const queries = ['#aiagent', '#vibecoding', '#LLM'];

    for (const platform of platforms) {
      for (const query of queries) {
        this.status.platform = platform;
        this.status.currentQuery = query;
        this.status.lastScanTime = new Date().toISOString();
        this.notifyCallbacks();

        // 스캔 시뮬레이션 (2-3초)
        await this.simulateDelay(2000 + Math.random() * 1000);

        // 랜덤하게 아이템 발견 시뮬레이션
        const found = Math.random() < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
        this.status.itemsFound += found;
        this.notifyCallbacks();
      }
    }

    this.status.platform = null;
    this.status.currentQuery = null;
    this.notifyCallbacks();
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback({ ...this.status }));
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
