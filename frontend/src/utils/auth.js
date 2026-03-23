const ROLES = ['admin', 'user', 'doctor'];
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';
const USER_KEY = 'user';

function normalizeRole(role) {
  if (!role) return null;
  const normalized = String(role).toLowerCase();
  if (normalized === 'farmer') return 'user';
  return ROLES.includes(normalized) ? normalized : null;
}

function readSessionJson(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionJson(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function parseJwt(token) {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

export function getTokenKey(role) {
  return normalizeRole(role) ? TOKEN_KEY : null;
}

export function getUserKey(role) {
  return normalizeRole(role) ? USER_KEY : null;
}

export function getRoleToken(role) {
  const normalized = normalizeRole(role);
  const activeRole = getActiveRole();
  if (!normalized || activeRole !== normalized) return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getRoleUser(role) {
  const normalized = normalizeRole(role);
  const activeRole = getActiveRole();
  if (!normalized || activeRole !== normalized) return null;
  return readSessionJson(USER_KEY);
}

export function setActiveRole(role) {
  const normalized = normalizeRole(role);
  if (!normalized) return;
  sessionStorage.setItem(ROLE_KEY, normalized);
}

export function getActiveRole() {
  return normalizeRole(sessionStorage.getItem(ROLE_KEY));
}

export function getActiveToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getActiveUser() {
  return readSessionJson(USER_KEY);
}

export function saveRoleSession({ role, token, user }) {
  const normalizedRole = normalizeRole(role || user?.role);
  if (!normalizedRole || !token) {
    throw new Error('Role and token are required to persist auth session.');
  }

  // One tab = one active session.
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(ROLE_KEY, normalizedRole);

  if (user) {
    writeSessionJson(USER_KEY, user);
  }
}

export function clearRoleSession(role) {
  const normalized = normalizeRole(role);
  const activeRole = getActiveRole();
  if (!normalized || !activeRole || activeRole === normalized) {
    clearAllSessions();
  }
}

export function clearAllSessions() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function migrateLegacySession() {
  // Intentionally no-op: auth state is sessionStorage only.
}

export function ensureValidActiveSession() {
  const role = getActiveRole();
  if (!role) return { role: null, token: null, user: null };

  const token = getActiveToken();
  if (!token || isTokenExpired(token)) {
    clearAllSessions();
    return { role: null, token: null, user: null };
  }

  const user = getActiveUser();

  return { role, token, user };
}

export function dashboardPathForRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return '/admin-dashboard';
  return '/dashboard';
}
