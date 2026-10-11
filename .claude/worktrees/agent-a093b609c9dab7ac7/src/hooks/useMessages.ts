import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Message {
  id: number;
  from_user_id: string;
  to_user_id: string | null;
  to_subject_id: string | null;
  subject: string;
  body: string;
  message_type: string;
  status: string;
  parent_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  from_profile?: { name: string; email: string; role: string } | null;
  to_profile?: { name: string; email: string; role: string } | null;
}

export function useMessages() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInbox = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      if (data) {
        // Fetch sender profiles
        const fromIds = [...new Set(data.map((m: any) => m.from_user_id).filter(Boolean))];
        let profilesMap: Record<string, { name: string; email: string; role: string }> = {};
        if (fromIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email, role')
            .in('id', fromIds);
          if (profiles) {
            profilesMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
          }
        }
        const msgs = (data as Message[]).map((m) => ({
          ...m,
          from_profile: profilesMap[m.from_user_id] || null,
        }));
        setInbox(msgs);
        setUnread(msgs.filter((m) => m.status === 'unread').length);
      }
    } catch (e: any) {
      console.warn('[useMessages] inbox error', e);
      setError(e.message);
    }
  }, [user]);

  const fetchSent = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;
      if (data) {
        // Fetch recipient profiles
        const toIds = [...new Set(data.map((m: any) => m.to_user_id).filter(Boolean))];
        let profilesMap: Record<string, { name: string; email: string; role: string }> = {};
        if (toIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, email, role')
            .in('id', toIds);
          if (profiles) {
            profilesMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
          }
        }
        const msgs = (data as Message[]).map((m) => ({
          ...m,
          to_profile: m.to_user_id ? profilesMap[m.to_user_id] || null : null,
        }));
        setSent(msgs);
      }
    } catch (e: any) {
      console.warn('[useMessages] sent error', e);
      setError(e.message);
    }
  }, [user]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchInbox(), fetchSent()]);
    setLoading(false);
  }, [fetchInbox, fetchSent]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  const sendMessage = async (params: {
    to_user_id?: string;
    to_subject_id?: string;
    subject: string;
    body: string;
    message_type?: string;
    parent_id?: number;
    metadata?: Record<string, unknown>;
  }) => {
    if (!user) return { error: 'Not authenticated' };
    const { error: err } = await supabase.from('messages').insert({
      from_user_id: user.id,
      to_user_id: params.to_user_id || null,
      to_subject_id: params.to_subject_id || null,
      subject: params.subject,
      body: params.body,
      message_type: params.message_type || 'message',
      parent_id: params.parent_id || null,
      metadata: params.metadata || null,
    });
    if (!err) {
      await fetchAll();
    }
    return { error: err?.message || null };
  };

  const markRead = async (messageId: number) => {
    const { error: err } = await supabase
      .from('messages')
      .update({ status: 'read', updated_at: new Date().toISOString() })
      .eq('id', messageId);
    if (!err) {
      setInbox((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: 'read' } : m))
      );
      setUnread((prev) => Math.max(0, prev - 1));
    }
  };

  const reply = async (parentId: number, body: string) => {
    const parent = inbox.find((m) => m.id === parentId) || sent.find((m) => m.id === parentId);
    if (!parent || !user) return { error: 'Message not found' };
    return sendMessage({
      to_user_id: parent.from_user_id === user.id ? (parent.to_user_id || undefined) : parent.from_user_id,
      subject: parent.subject.startsWith('Re: ') ? parent.subject : `Re: ${parent.subject}`,
      body,
      message_type: parent.message_type,
      parent_id: parentId,
    });
  };

  return { inbox, sent, unread, sendMessage, markRead, reply, loading, error, refetch: fetchAll };
}
