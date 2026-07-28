import { useCallback, useState } from 'react';

/**
 * Platform-wide first-visit onboarding gate.
 *
 * Persists completion in localStorage under a versioned key so that a future
 * onboarding revision can force a re-show simply by bumping the version.
 *
 * - `showOnboarding` — true until the user has completed/skipped once.
 * - `completeOnboarding()` — mark done + persist (called on finish AND skip).
 * - `restartOnboarding()` — clear persistence + re-show (Settings affordance).
 */
export const ONBOARDING_STORAGE_KEY = 'arkheosium.onboarded.v1';

function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  } catch {
    // Private mode / storage disabled — never block the app.
    return true;
  }
}

export function usePlatformOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => !hasOnboarded());

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
    } catch {
      /* ignore storage errors */
    }
    setShowOnboarding(false);
  }, []);

  const restartOnboarding = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
    setShowOnboarding(true);
  }, []);

  return { showOnboarding, completeOnboarding, restartOnboarding };
}

/**
 * Fire-and-forget restart helper for places that don't use the hook
 * (e.g. a Settings page that just wants to reset + reload).
 */
export function resetPlatformOnboarding() {
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
