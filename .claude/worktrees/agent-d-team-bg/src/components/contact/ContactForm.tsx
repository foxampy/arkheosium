// ═══════════════════════════════════════════════════════════════
//  ContactForm — modal-form для отправки обращения через /api/contact
//  Используется в UnifiedHeader (кнопка "Связь")
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

const initial: FormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm({ open, onOpenChange }: ContactFormProps) {
  const [data, setData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState<string>('');

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!data.name.trim()) newErrors.name = 'Укажите ваше имя';
    if (!data.email.trim()) newErrors.email = 'Укажите email';
    else if (!EMAIL_RE.test(data.email.trim())) newErrors.email = 'Некорректный email';
    if (!data.message.trim()) newErrors.message = 'Введите сообщение';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    setServerError('');
    try {
      const payload = {
        name: data.name.trim(),
        company: data.company.trim() || undefined,
        email: data.email.trim(),
        phone: data.phone.trim() || undefined,
        message: data.message.trim(),
      };
      const res = await apiRequest('POST', '/api/contact', payload);
      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          setData(initial);
          setStatus('idle');
          onOpenChange(false);
        }, 2500);
      } else {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error || 'Не удалось отправить сообщение. Попробуйте позже.');
        setStatus('error');
      }
    } catch (err) {
      setServerError('Ошибка сети. Проверьте подключение.');
      setStatus('error');
    }
  };

  const handleClose = (next: boolean) => {
    if (status === 'submitting') return;
    if (!next) {
      // reset after close
      setTimeout(() => {
        setData(initial);
        setErrors({});
        setStatus('idle');
        setServerError('');
      }, 200);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Связаться с нами</DialogTitle>
          <DialogDescription className="text-slate-400">
            Заполните форму, и мы свяжемся с вами в ближайшее время.
          </DialogDescription>
        </DialogHeader>

        {status === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-medium">Спасибо!</p>
            <p className="text-slate-400 text-sm mt-1">
              Мы свяжемся с вами в ближайшее время.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 mb-1 block">
                Имя <span className="text-red-400">*</span>
              </label>
              <Input
                value={data.name}
                onChange={handleChange('name')}
                placeholder="Ваше имя"
                disabled={status === 'submitting'}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Компания</label>
              <Input
                value={data.company}
                onChange={handleChange('company')}
                placeholder="Название организации"
                disabled={status === 'submitting'}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">
                Email <span className="text-red-400">*</span>
              </label>
              <Input
                type="email"
                value={data.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                disabled={status === 'submitting'}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">Телефон</label>
              <Input
                type="tel"
                value={data.phone}
                onChange={handleChange('phone')}
                placeholder="+998 ..."
                disabled={status === 'submitting'}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 mb-1 block">
                Сообщение <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={data.message}
                onChange={handleChange('message')}
                rows={6}
                placeholder="Опишите ваш вопрос или предложение..."
                disabled={status === 'submitting'}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
              {errors.message && (
                <p className="text-xs text-red-400 mt-1">{errors.message}</p>
              )}
            </div>

            {status === 'error' && serverError && (
              <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{serverError}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
