import { InjectionToken } from '@angular/core';

export interface RuntimeConfig {
  apiBaseUrl: string;
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  apiBaseUrl: 'http://localhost:8080/api',
};

export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG');

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  try {
    const response = await fetch('/qwizle-config.json', { cache: 'no-store' });
    if (!response.ok) {
      return DEFAULT_RUNTIME_CONFIG;
    }
    return normalizeRuntimeConfig(await response.json());
  } catch {
    return DEFAULT_RUNTIME_CONFIG;
  }
}

export function apiUrl(config: RuntimeConfig, path: string): string {
  const base = config.apiBaseUrl.replace(/\/+$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

function normalizeRuntimeConfig(value: unknown): RuntimeConfig {
  if (!isRuntimeConfigLike(value)) {
    return DEFAULT_RUNTIME_CONFIG;
  }

  const apiBaseUrl = value.apiBaseUrl.trim().replace(/\/+$/, '');
  return apiBaseUrl ? { apiBaseUrl } : DEFAULT_RUNTIME_CONFIG;
}

function isRuntimeConfigLike(value: unknown): value is { apiBaseUrl: string } {
  return typeof value === 'object'
    && value !== null
    && 'apiBaseUrl' in value
    && typeof value.apiBaseUrl === 'string';
}
