import { apiUrl, DEFAULT_RUNTIME_CONFIG, loadRuntimeConfig } from './runtime-config';

describe('runtime config', () => {
  it('loads the API base URL from the runtime config file', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(JSON.stringify({
      apiBaseUrl: 'https://api.example.test/api/',
    }))));

    expect(await loadRuntimeConfig()).toEqual({ apiBaseUrl: 'https://api.example.test/api' });
    expect(window.fetch).toHaveBeenCalledWith('/qwizle-config.json', { cache: 'no-store' });
  });

  it('uses the default config when the runtime config cannot be loaded', async () => {
    spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('not found')));

    expect(await loadRuntimeConfig()).toEqual(DEFAULT_RUNTIME_CONFIG);
  });

  it('builds API URLs without duplicate slashes', () => {
    expect(apiUrl({ apiBaseUrl: 'https://api.example.test/api/' }, '/auth/login'))
      .toBe('https://api.example.test/api/auth/login');
  });
});
