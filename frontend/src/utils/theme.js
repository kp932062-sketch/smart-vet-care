const THEME_KEY = 'smartvet-theme';

export function getStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  localStorage.setItem(THEME_KEY, nextTheme);
  window.dispatchEvent(new CustomEvent('smartvet-theme-changed', { detail: { theme: nextTheme } }));
  return nextTheme;
}

export function initTheme() {
  return applyTheme(getStoredTheme());
}

export function toggleTheme() {
  const current = getStoredTheme();
  return applyTheme(current === 'dark' ? 'light' : 'dark');
}
