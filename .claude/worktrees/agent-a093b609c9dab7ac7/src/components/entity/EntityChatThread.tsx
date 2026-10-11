// ═══════════════════════════════════════════════════════════════
//  EntityChatThread — обсуждение под каждым проектом/объектом/субъектом
//  Чтение публично, отправка требует авторизации
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Lock } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: number;
  threadId: number;
  userId: string | null;
  authorName: string | null;
  text: string;
  createdAt: string;
}

interface ChatThread {
  id: number;
  entityType: string;
  entityId: string;
  title: string | null;
}

interface Props {
  entityType: string;
  entityId: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '');
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('ru', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export function EntityChatThread({ entityType, entityId }: Props) {
  const queryKey = ['/api/chat', entityType, entityId];
  const { user } = useAuth();
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<{ thread: ChatThread; messages: ChatMessage[] }>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/chat/${entityType}/${encodeURIComponent(entityId)}`);
      if (!res.ok) throw new Error('failed');
      return res.json();
    },
  });

  const postMessage = useMutation({
    mutationFn: async (txt: string) => {
      const res = await apiRequest('POST', `/api/chat/${entityType}/${encodeURIComponent(entityId)}/messages`, { text: txt });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'failed');
      }
      return res.json();
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    postMessage.mutate(text.trim());
  };

  const messages = data?.messages ?? [];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-cyan-400" />
        Обсуждение
        {messages.length > 0 && (
          <span className="text-sm text-slate-500 font-normal">({messages.length})</span>
        )}
      </h2>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        {/* Messages list */}
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="text-center text-slate-500 text-sm py-6">Загрузка обсуждения...</div>
          )}
          {isError && (
            <div className="text-center text-red-400 text-sm py-6">
              Не удалось загрузить обсуждение
            </div>
          )}
          {!isLoading && !isError && messages.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-8">
              Пока нет сообщений. Будьте первым, кто оставит мнение.
            </div>
          )}
          {messages.map((m: ChatMessage) => (
            <div key={m.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                {initials(m.authorName ?? 'A')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{m.authorName ?? 'Пользователь'}</span>
                  <span className="text-xs text-slate-500">{formatTime(m.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Compose */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/50">
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ваше сообщение..."
                rows={3}
                maxLength={2000}
                disabled={postMessage.isPending}
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{text.length}/2000</span>
                <Button
                  type="submit"
                  disabled={!text.trim() || postMessage.isPending}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-600 text-black"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Отправить
                </Button>
              </div>
              {postMessage.isError && (
                <p className="text-xs text-red-400">Не удалось отправить — попробуйте ещё раз</p>
              )}
            </form>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-2 px-1">
              <Lock className="w-4 h-4" />
              <span>
                Чтобы оставить сообщение,{' '}
                <Link href="/account" className="text-cyan-400 hover:underline">
                  войдите
                </Link>
                .
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
