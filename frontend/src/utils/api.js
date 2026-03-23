import axios from 'axios';
import { clearRoleSession, getActiveRole, getActiveToken } from './auth';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const isBrowser = typeof window !== 'undefined';
const isLocalHost =
  isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);

const absoluteConfiguredApiUrl = /^https?:\/\//i.test(configuredApiUrl)
  ? configuredApiUrl
  : null;

const baseUrlCandidates = Array.from(
  new Set(
    (isLocalHost
      ? [
          '/api',
          absoluteConfiguredApiUrl,
          'http://127.0.0.1:5000/api',
          'http://127.0.0.1:5001/api',
          'http://127.0.0.1:5002/api',
          configuredApiUrl
        ]
      : [configuredApiUrl, '/api']
    ).filter(Boolean)
  )
);

let activeBaseUrl = baseUrlCandidates[0] || '/api';

const api = axios.create({
  baseURL: activeBaseUrl,
  withCredentials: true,
  timeout: 10000
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  config.baseURL = activeBaseUrl;
  const token = isBrowser ? getActiveToken() : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.__triedBaseUrls = config.__triedBaseUrls || [activeBaseUrl];
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const requestConfig = error?.config || {};
    const method = (requestConfig.method || 'get').toLowerCase();

    // Handle unauthorized responses without forcing full-page redirect.
    if (status === 401) {
      const requestUrl = String(requestConfig.url || '');
      const isAuthCall =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/doctor-link-login');

      const backendMessage = String(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        ''
      ).toLowerCase();

      const tokenInvalid =
        backendMessage.includes('token') ||
        backendMessage.includes('jwt') ||
        backendMessage.includes('expired') ||
        backendMessage.includes('invalid');

      if (!isAuthCall) {
        const activeRole = isBrowser ? getActiveRole() : null;
        // Clear only when backend explicitly indicates token problems.
        if (isBrowser && activeRole && tokenInvalid) {
          clearRoleSession(activeRole);
        }
      }

      return Promise.reject(error);
    }

    // In local dev, auto-failover read requests between known backend ports.
    const canRetry =
      isLocalHost &&
      !error.response &&
      ['get', 'head', 'options'].includes(method) &&
      baseUrlCandidates.length > 1;

    if (canRetry) {
      const tried = requestConfig.__triedBaseUrls || [activeBaseUrl];
      const nextBaseUrl = baseUrlCandidates.find((url) => !tried.includes(url));

      if (nextBaseUrl) {
        activeBaseUrl = nextBaseUrl;
        requestConfig.baseURL = nextBaseUrl;
        requestConfig.__triedBaseUrls = [...tried, nextBaseUrl];
        return api.request(requestConfig);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
