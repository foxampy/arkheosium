import { useCallback, useState } from 'react';
import type {
  ChatMessage,
  LabBlock,
  LabChatResponse,
  LabMode,
} from '@/lib/labTypes';

interface LabChatState {
  loading: boolean;
  error: string | null;
  errorCode: LabChatResponse['error_code'] | null;
  lastPatched: string[];
}

interface SendArgs {
  model: string;
  mode: LabMode;
  userText: string;
  messages: ChatMessage[];
  blocks: LabBlock[];
}

/**
 * Drives the Project Lab chat. Calls /api/lab-chat which returns both a
 * conversational reply AND structured block updates. The caller applies the
 * reply + block patches to its own state (this hook stays stateless re: content).
 */
export function useLabChat() {
  const [state, setState] = useState<LabChatState>({
    loading: false,
    error: null,
    errorCode: null,
    lastPatched: [],
  });

  const send = useCallback(
    async ({ model, mode, userText, messages, blocks }: SendArgs): Promise<LabChatResponse | null> => {
      setState({ loading: true, error: null, errorCode: null, lastPatched: [] });
      try {
        const payload = {
          model,
          mode,
          messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: 'user' as const, content: userText }],
          blocks: blocks.map((b) => ({ id: b.id, title: b.title, content: b.content })),
        };
        const res = await fetch('/api/lab-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = (await res.json()) as LabChatResponse;
        setState({
          loading: false,
          error: json.ok ? null : json.error ?? 'Ошибка запроса',
          errorCode: json.error_code ?? null,
          lastPatched: json.block_updates?.map((u) => u.id) ?? [],
        });
        return json;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Сетевая ошибка';
        setState({ loading: false, error: msg, errorCode: 'INTERNAL', lastPatched: [] });
        return null;
      }
    },
    [],
  );

  return { ...state, send };
}
