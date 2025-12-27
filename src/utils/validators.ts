export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isGitHubURL(url: string): boolean {
  return isValidURL(url) && url.includes('github.com');
}

export function isPyPIURL(url: string): boolean {
  return isValidURL(url) && (url.includes('pypi.org') || url.includes('pypi.python.org'));
}

export function isDocumentationURL(url: string): boolean {
  if (!isValidURL(url)) return false;
  const docPatterns = [
    /readthedocs\.io/,
    /docs\./,
    /documentation/,
    /\.io\/docs/,
  ];
  return docPatterns.some(pattern => pattern.test(url));
}

export function validateResourceInput(data: Partial<{
  title: string;
  url: string;
  type: string;
}>): { valid: boolean; error?: string } {
  if (!data.title || data.title.trim().length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  if (!data.url || !isValidURL(data.url)) {
    return { valid: false, error: 'Valid URL is required' };
  }
  return { valid: true };
}

