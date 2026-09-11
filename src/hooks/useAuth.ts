import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  organization?: string;
  region?: string;
  phone?: string;
  telegram?: string;
  website?: string;
  created_at?: string;
}

const ROLES = [
  { id: 'manager', label: 'Управляющий объектом/субъектом' },
  { id: 'employee', label: 'Менеджер / Сотрудник' },
  { id: 'investor', label: 'Инвестор' },
  { id: 'researcher', label: 'R&D Исследователь' },
  { id: 'developer', label: 'Разработчик' },
  { id: 'partner', label: 'Партнёр' },
  { id: 'admin', label: 'Администратор' },
  { id: 'other', label: 'Другое' },
] as const;

// Роли, которые человек выбирает сам при регистрации и в профиле.
// «Администратор» из этого списка исключён намеренно: пока он в нём стоял,
// зарегистрироваться администратором мог кто угодно — форма писала выбранное
// значение прямо в `profiles.role`, а политика `profiles_update_own` этого
// не запрещала. Со стороны базы вход теперь закрыт триггером
// `guard_profile_role` (миграция 28.08.2026); здесь убирается сама приманка.
// `ROLES` остаётся полным — по нему ищется подпись уже назначенной роли.
const SELECTABLE_ROLES = ROLES.filter((r) => r.id !== 'admin');

export { ROLES, SELECTABLE_ROLES };

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as UserProfile);
  }, []);

  useEffect(() => {
    // Get initial session (handles OAuth callback tokens in URL hash/query)
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    // Listen for auth changes — on SIGNED_IN redirect to home so the
    // OAuth callback URL (/account?code=...) doesn't stay in the address bar
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      else setProfile(null);

      if (event === 'SIGNED_IN' && s) {
        // After an OAuth redirect, the URL contains callback params (?code=... or #access_token=...).
        // Replace the current history entry so the user lands on the main map and
        // pressing Back doesn't loop back to the OAuth callback URL.
        // Only do a hard redirect if the URL still contains OAuth callback params.
        const hasOAuthParams =
          window.location.search.includes('code=') ||
          window.location.hash.includes('access_token=');
        if (hasOAuthParams) {
          window.location.replace('/');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/account`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUpWithEmail = async (email: string, password: string, name: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    if (!error && data.user) {
      // Create profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        name,
        role,
      });
    }
    return { data, error };
  };

  const signInWithMagicLink = async (email: string) => {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (!error) {
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
    }
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signOut,
    updateProfile,
  };
}
