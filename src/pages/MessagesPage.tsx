import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  Inbox, Send, PenSquare, X, Search, Loader2,
  ChevronDown, ArrowLeft, Mail, Clock, Check, CheckCheck,
  MessageSquare, FileText, HelpCircle, UserPlus,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMessages, type Message } from '@/hooks/useMessages';
import { supabase } from '@/lib/supabase';

const MESSAGE_TYPES = [
  { id: 'message', label: 'Сообщение', icon: MessageSquare, color: '#60a5fa' },
  { id: 'proposal', label: 'Предложение', icon: FileText, color: '#4ade80' },
  { id: 'inquiry', label: 'Запрос', icon: HelpCircle, color: '#fbbf24' },
  { id: 'invitation', label: 'Приглашение', icon: UserPlus, color: '#a78bfa' },
];

function getTypeInfo(type: string) {
  return MESSAGE_TYPES.find((t) => t.id === type) || MESSAGE_TYPES[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} д`;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ── Compose Modal ──────────────────────────────────────────
interface ComposeProps {
  onClose: () => void;
  onSend: (params: { to_user_id?: string; to_subject_id?: string; subject: string; body: string; message_type: string }) => Promise<{ error: string | null }>;
  prefillSubjectId?: string;
  prefillSubjectName?: string;
}

function ComposeModal({ onClose, onSend, prefillSubjectId, prefillSubjectName }: ComposeProps) {
  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientType, setRecipientType] = useState<'user' | 'subject'>(prefillSubjectId ? 'subject' : 'user');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [subjectId, setSubjectId] = useState(prefillSubjectId || '');
  const [subjectName, setSubjectName] = useState(prefillSubjectName || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [messageType, setMessageType] = useState('message');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Search users
  useEffect(() => {
    if (recipientType !== 'user' || recipientSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .or(`name.ilike.%${recipientSearch}%,email.ilike.%${recipientSearch}%`)
        .limit(5);
      if (data) {
        setSearchResults(data);
        setShowResults(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [recipientSearch, recipientType]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Заполните тему и текст сообщения');
      return;
    }
    if (recipientType === 'user' && !selectedUserId) {
      setError('Выберите получателя');
      return;
    }
    setSending(true);
    setError('');
    const result = await onSend({
      to_user_id: recipientType === 'user' ? (selectedUserId || undefined) : undefined,
      to_subject_id: recipientType === 'subject' ? subjectId : undefined,
      subject: subject.trim(),
      body: body.trim(),
      message_type: messageType,
    });
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'rgba(5,15,35,0.98)', border: '1px solid rgba(0,200,230,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">Новое сообщение</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Recipient type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setRecipientType('user')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={recipientType === 'user'
                ? { background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Пользователю
            </button>
            <button
              onClick={() => setRecipientType('subject')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
              style={recipientType === 'subject'
                ? { background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }
                : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Организации
            </button>
          </div>

          {/* Recipient */}
          {recipientType === 'user' ? (
            <div className="relative">
              {selectedUserId ? (
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,200,230,0.15)' }}>
                  <span className="text-sm text-white flex-1">{selectedUserName}</span>
                  <button onClick={() => { setSelectedUserId(null); setSelectedUserName(''); setRecipientSearch(''); }} className="text-white/30 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowResults(true)}
                    placeholder="Поиск по имени или email..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
                  />
                </>
              )}
              {showResults && searchResults.length > 0 && !selectedUserId && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10" style={{ background: 'rgba(5,15,35,0.98)', border: '1px solid rgba(0,200,230,0.15)' }}>
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setSelectedUserId(u.id); setSelectedUserName(u.name); setShowResults(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition"
                    >
                      <span className="text-sm text-white">{u.name}</span>
                      <span className="text-xs text-white/30">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Название организации"
                className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
              />
              <input
                type="text"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                placeholder="ID субъекта (опционально)"
                className="w-full h-9 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 placeholder-white/20 outline-none focus:border-cyan-500/40"
              />
            </div>
          )}

          {/* Message type */}
          <div>
            <label className="text-xs text-white/30 mb-1.5 block">Тип сообщения</label>
            <div className="flex gap-2 flex-wrap">
              {MESSAGE_TYPES.map((t) => {
                const Icon = t.icon;
                const active = messageType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setMessageType(t.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                    style={active
                      ? { background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }
                      : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <Icon className="w-3 h-3" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Тема"
            className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40"
          />

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Текст сообщения..."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 resize-none"
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(34,211,238,0.1))', border: '1px solid rgba(34,211,238,0.3)' }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Отправить
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Message List Item ──────────────────────────────────────
function MessageRow({ msg, onClick, isSent }: { msg: Message; onClick: () => void; isSent?: boolean }) {
  const typeInfo = getTypeInfo(msg.message_type);
  const isUnread = !isSent && msg.status === 'unread';
  const displayName = isSent
    ? msg.to_profile?.name || msg.to_subject_id || 'Получатель'
    : msg.from_profile?.name || 'Отправитель';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all hover:bg-white/[0.03] group"
      style={{ background: isUnread ? 'rgba(6,182,212,0.03)' : 'transparent', border: `1px solid ${isUnread ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.04)'}` }}
    >
      {/* Unread dot */}
      <div className="pt-1.5 shrink-0 w-2">
        {isUnread && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
      </div>

      <div className="flex-1 min-w-0">
        {/* Sender + date */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className={`text-sm font-semibold truncate ${isUnread ? 'text-white' : 'text-white/70'}`}>
            {displayName}
          </span>
          <span className="text-[10px] text-white/25 shrink-0 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {formatDate(msg.created_at)}
          </span>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
            style={{ background: `${typeInfo.color}12`, color: typeInfo.color }}
          >
            {typeInfo.label}
          </span>
          <span className={`text-sm truncate ${isUnread ? 'text-white/80' : 'text-white/50'}`}>
            {msg.subject}
          </span>
        </div>

        {/* Preview */}
        <p className="text-xs text-white/30 truncate">{msg.body}</p>
      </div>

      {/* Status icon for sent */}
      {isSent && (
        <div className="pt-1 shrink-0">
          {msg.status === 'read' ? (
            <CheckCheck className="w-3.5 h-3.5 text-cyan-400/60" />
          ) : (
            <Check className="w-3.5 h-3.5 text-white/20" />
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Thread View ────────────────────────────────────────────
function ThreadView({ message, onBack, onReply, allMessages }: {
  message: Message;
  onBack: () => void;
  onReply: (parentId: number, body: string) => Promise<{ error: string | null }>;
  allMessages: Message[];
}) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Build thread
  const thread = useMemo(() => {
    const msgs: Message[] = [];
    // Find root
    let rootId = message.id;
    let current: Message | undefined = message;
    while (current?.parent_id) {
      const parent = allMessages.find((m) => m.id === current!.parent_id);
      if (parent) {
        rootId = parent.id;
        current = parent;
      } else break;
    }
    // Collect all in thread
    const collect = (id: number) => {
      const msg = allMessages.find((m) => m.id === id);
      if (msg) msgs.push(msg);
      allMessages.filter((m) => m.parent_id === id).forEach((m) => collect(m.id));
    };
    collect(rootId);
    return msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [message, allMessages]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    await onReply(message.id, replyText.trim());
    setReplyText('');
    setSending(false);
  };

  const typeInfo = getTypeInfo(message.message_type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
        <button onClick={onBack} className="text-white/40 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white truncate">{message.subject}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ background: `${typeInfo.color}12`, color: typeInfo.color }}>
              {typeInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {thread.map((msg) => {
          const senderName = msg.from_profile?.name || 'Отправитель';
          return (
            <div key={msg.id} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white">{senderName}</span>
                <span className="text-[10px] text-white/25">{formatDate(msg.created_at)}</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{msg.body}</p>
            </div>
          );
        })}
      </div>

      {/* Reply */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Написать ответ..."
            rows={2}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/40 resize-none"
          />
          <button
            onClick={handleReply}
            disabled={sending || !replyText.trim()}
            className="self-end px-4 h-10 rounded-xl text-sm font-medium text-white transition disabled:opacity-30"
            style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(34,211,238,0.3)' }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function MessagesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { inbox, sent, unread, sendMessage, markRead, reply, loading, refetch } = useMessages();
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [search, setSearch] = useState('');

  // Check for prefill from query params (compose to subject)
  const [prefillSubjectId, setPrefillSubjectId] = useState<string | undefined>();
  const [prefillSubjectName, setPrefillSubjectName] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('to_subject');
    const sname = params.get('subject_name');
    if (sid) {
      setPrefillSubjectId(sid);
      setPrefillSubjectName(sname || sid);
      setShowCompose(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation('/account');
    }
  }, [authLoading, isAuthenticated, setLocation]);

  const allMessages = useMemo(() => [...inbox, ...sent], [inbox, sent]);

  const currentList = tab === 'inbox' ? inbox : sent;
  const filtered = useMemo(() => {
    if (!search) return currentList;
    const q = search.toLowerCase();
    return currentList.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q) ||
        (m.from_profile?.name || '').toLowerCase().includes(q) ||
        (m.to_profile?.name || '').toLowerCase().includes(q)
    );
  }, [currentList, search]);

  const handleMessageClick = async (msg: Message) => {
    if (tab === 'inbox' && msg.status === 'unread') {
      await markRead(msg.id);
    }
    setSelectedMessage(msg);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-14 flex flex-col">

      {selectedMessage ? (
        <ThreadView
          message={selectedMessage}
          onBack={() => setSelectedMessage(null)}
          onReply={async (parentId, body) => {
            const result = await reply(parentId, body);
            return result;
          }}
          allMessages={allMessages}
        />
      ) : (
        <>
          {/* Header */}
          <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-white/5">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-white">Сообщения</h1>
                  <p className="text-xs text-white/30 mt-0.5">
                    {unread > 0 ? `${unread} непрочитанных` : 'Нет новых сообщений'}
                  </p>
                </div>
                <button
                  onClick={() => { setPrefillSubjectId(undefined); setPrefillSubjectName(undefined); setShowCompose(true); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                  style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(34,211,238,0.3)' }}
                >
                  <PenSquare className="w-4 h-4" /> Написать
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setTab('inbox')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                  style={tab === 'inbox'
                    ? { background: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }
                    : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}
                >
                  <Inbox className="w-4 h-4" />
                  Входящие
                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setTab('sent')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition"
                  style={tab === 'sent'
                    ? { background: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }
                    : { color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }}
                >
                  <Send className="w-4 h-4" />
                  Отправленные
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по сообщениям..."
                  className="w-full h-10 pl-9 pr-8 rounded-xl bg-white/4 border border-white/8 text-sm text-white placeholder-white/20 outline-none focus:border-cyan-500/30 transition"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            <div className="max-w-2xl mx-auto space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-cyan-400/40 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Mail className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">
                    {search ? 'Сообщения не найдены' : tab === 'inbox' ? 'Нет входящих сообщений' : 'Нет отправленных сообщений'}
                  </p>
                </div>
              ) : (
                filtered.map((msg) => (
                  <MessageRow
                    key={msg.id}
                    msg={msg}
                    isSent={tab === 'sent'}
                    onClick={() => handleMessageClick(msg)}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Compose modal */}
      <AnimatePresence>
        {showCompose && (
          <ComposeModal
            onClose={() => setShowCompose(false)}
            onSend={sendMessage}
            prefillSubjectId={prefillSubjectId}
            prefillSubjectName={prefillSubjectName}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
