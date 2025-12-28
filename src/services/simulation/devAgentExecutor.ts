export class DevAgentExecutor {
  async execute(command: string, options?: { dryRun?: boolean }): Promise<string> {
    // 실제 dev-agent 실행 대신 모의 로그를 반환
    const steps = [
      `명령 수신: ${command}`,
      options?.dryRun ? '드라이런 모드: 실제 실행 없이 검증' : '실행 준비 중...',
      '환경 확인: OK',
      '필요한 의존성 체크: OK',
      '로그 수집 완료',
    ];
    return steps.join(' | ');
  }
}
