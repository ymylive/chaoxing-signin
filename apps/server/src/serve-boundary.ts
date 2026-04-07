import * as path from 'path';

const STATIC_ASSET_PATTERN = /^(index.html|assets\/|.*\.(css|js|map|svg|png|jpg|jpeg|ico|txt))$/i;

export const getHeaderToken = (headerValue: string | string[] | undefined): string => {
  if (typeof headerValue === 'string') return headerValue;
  return '';
};

export const getUploadToken = (
  uploadHeaderValue: string | string[] | undefined,
  queryToken: unknown
): string => {
  const tokenFromHeader = getHeaderToken(uploadHeaderValue);
  if (tokenFromHeader) return tokenFromHeader;
  if (typeof queryToken === 'string') return queryToken;
  return '';
};

export const resolveStaticAssetPath = (webRoot: string, requestPath: string): string | null => {
  let decodedPath = requestPath;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    return null;
  }

  const relativePath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
  if (!STATIC_ASSET_PATTERN.test(relativePath)) return null;

  const resolvedPath = path.resolve(webRoot, relativePath);
  const relativeToRoot = path.relative(webRoot, resolvedPath);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) return null;

  return resolvedPath;
};

export const getDefaultListenHost = (isServerless: boolean): string | null => {
  return isServerless ? null : '127.0.0.1';
};

type ExitAwareProcess = {
  once(event: 'exit', listener: (...args: any[]) => void): void;
};

type ProcessEntry<TProcess extends ExitAwareProcess> = {
  process: TProcess;
};

export const attachProcessExitCleanup = <TProcess extends ExitAwareProcess, TEntry extends ProcessEntry<TProcess>>(
  processMap: Map<string, TEntry>,
  key: string,
  monitorProcess: TProcess
): void => {
  monitorProcess.once('exit', () => {
    const existing = processMap.get(key);
    if (existing?.process === monitorProcess) {
      processMap.delete(key);
    }
  });
};
