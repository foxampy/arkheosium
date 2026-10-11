# Stripe Setup — VODPROM

## Шаг 1: Создать аккаунт Stripe
1. Перейди на https://stripe.com
2. Зарегистрируйся (или войди)
3. Активируй аккаунт (нужен для live-ключей)

## Шаг 2: Получить ключи

В Stripe Dashboard → Developers → API Keys:

| Ключ | Где использовать |
|------|-----------------|
| `pk_test_...` / `pk_live_...` | `.env` → `VITE_STRIPE_PUBLISHABLE_KEY` |
| `sk_test_...` / `sk_live_...` | Supabase Secrets ТОЛЬКО |

## Шаг 3: Добавить в .env
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_ТВОЙ_КЛЮЧ
```

## Шаг 4: Добавить secret key в Supabase
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_ТВОЙ_СЕКРЕТ
# или через UI: supabase.com → Project → Settings → Edge Functions → Secrets
```

## Шаг 5: Задеплоить Edge Function
```bash
cd F:\VODECO\vodprom
supabase functions deploy create-payment-intent
```

## Шаг 6: Настроить Webhook (для продакшна)
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://cllbxumyagfhtcexqxvh.supabase.co/functions/v1/stripe-webhook`
3. Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Тестовые карты
| Карта | Результат |
|-------|----------|
| 4242 4242 4242 4242 | Успех |
| 4000 0000 0000 0002 | Отказ |
| 4000 0025 0000 3155 | Требует 3DS |
Дата: любая в будущем, CVC: любые 3 цифры

## Принимаемые валюты
USD, EUR, RUB, KZT (через конвертацию), USDT (отдельно через crypto)

## Текущий статус
- ✅ Edge Function создана: `supabase/functions/create-payment-intent/index.ts`
- ✅ useStripePayment хук: `src/hooks/useStripePayment.ts`
- ✅ Таблица investment_applications создана в Supabase
- ⏳ Ждёт: добавить `VITE_STRIPE_PUBLISHABLE_KEY` в .env
- ⏳ Ждёт: задеплоить Edge Function командой выше
