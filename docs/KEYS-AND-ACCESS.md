# 🔑 Ключи и доступы ArkheOSium — куда что положить

Этот файл — полная шпаргалка: какие ключи нужны, где их взять и **куда именно вписать**.
Проект: **arkheosium** (Vercel) · https://arkheosium.vercel.app

---

## 📁 Два места, где живут ключи

| Место | Для чего | Файл / панель |
|-------|----------|---------------|
| **1. Локально** (твой ПК) | запуск `npm run dev` на машине | `F:\VODECO\ArkheOSium\.env.local` |
| **2. Vercel** (продакшн) | работа сайта в интернете | Vercel → Project **arkheosium** → **Settings → Environment Variables** |

> ⚠️ **Правило:** ключи с префиксом `VITE_` видны в браузере (публичные, только anon-ключи!).
> Ключи БЕЗ `VITE_` (Gemini, service_role) — секретные, они **только на сервере Vercel**, в браузер не попадают. Никогда не давай `VITE_` префикс секретным ключам.

---

## 1️⃣ Supabase (база данных) — ОБЯЗАТЕЛЬНО

Где взять: https://supabase.com → твой проект → **Settings → API**.

Нужны 3 значения:

| Что копируешь в Supabase | Куда вписать | Секретность |
|--------------------------|--------------|-------------|
| **Project URL** (`https://xxxx.supabase.co`) | `VITE_SUPABASE_URL` **и** `SUPABASE_URL` | публично |
| **anon / public** ключ | `VITE_SUPABASE_ANON_KEY` | публично (ок) |
| **service_role** ключ (секретный!) | `SUPABASE_SERVICE_ROLE_KEY` | 🔒 СЕКРЕТ, только сервер |

### Локально — файл `.env.local`
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...ТВОЙ_ANON_КЛЮЧ
```
(service_role локально не нужен — он только для серверной функции genesis.)

### На Vercel (Settings → Environment Variables) — добавь ВСЕ 4:
```
VITE_SUPABASE_URL            = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY       = eyJhbGciOi...anon
SUPABASE_URL                 = https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY    = eyJhbGciOi...service_role  🔒
```

---

## 2️⃣ Gemini API (ИИ-генерация «Genesis») — для серверной функции `/api/genesis`

Где взять: https://aistudio.google.com/apikey → **Create API key** (можно сделать несколько ключей — они используются по кругу, round-robin, чтобы не упираться в лимиты).

Эти ключи **только на Vercel** (секретные, БЕЗ `VITE_`). В `.env.local` не нужны, если ты не запускаешь serverless-функции локально.

### На Vercel (Settings → Environment Variables):
```
GEMINI_API_KEY_1   = AIzaSy...ключ1
GEMINI_API_KEY_2   = AIzaSy...ключ2      (необязательно, но желательно)
GEMINI_API_KEY_3   = AIzaSy...ключ3      (необязательно)
GEMINI_API_KEY_4   = AIzaSy...ключ4      (необязательно)
GEMINI_KEY_COUNT   = 4                    (сколько ключей сканировать; по умолчанию 4)
```
> Минимум — один `GEMINI_API_KEY_1`. Тогда поставь `GEMINI_KEY_COUNT = 1`.
> Если ключей Gemini нет — функция Genesis вернёт ошибку «Ключи Gemini не настроены», но остальной сайт работает.

---

## 3️⃣ Google OAuth (вход через Google) — ОПЦИОНАЛЬНО

Нужен, только если включаешь кнопку «Войти через Google» (через Supabase Auth).

1. https://console.cloud.google.com → **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
2. **Authorized redirect URI** укажи (берётся из Supabase → Authentication → Providers → Google):
   ```
   https://xxxx.supabase.co/auth/v1/callback
   ```
3. Скопируй **Client ID** и **Client Secret**.
4. Вставь их НЕ в код, а в **Supabase → Authentication → Providers → Google** (включить + вставить Client ID / Secret). Больше никуда класть не надо — Supabase хранит их у себя.

> То есть для Google OAuth ключи идут в **Supabase**, а не в `.env` и не в Vercel.

---

## ✅ Итоговый чек-лист «положил / не положил»

- [ ] `.env.local` создан локально с `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- [ ] На Vercel добавлены: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] На Vercel добавлены: `GEMINI_API_KEY_1` (+ доп. ключи) и `GEMINI_KEY_COUNT`
- [ ] (если нужен вход Google) Client ID/Secret вставлены в Supabase → Auth → Providers → Google
- [ ] После добавления переменных на Vercel — сделать **Redeploy** (переменные подхватываются только при новой сборке)

---

## 🧭 Быстрый ответ на вопрос «что и куда»

| Ключ | Где взять | Куда положить |
|------|-----------|---------------|
| Supabase URL | Supabase → Settings → API | `.env.local` + Vercel (2 имени) |
| Supabase anon | Supabase → Settings → API | `.env.local` + Vercel |
| Supabase service_role 🔒 | Supabase → Settings → API | **только Vercel** |
| Gemini API 🔒 | aistudio.google.com/apikey | **только Vercel** (`GEMINI_API_KEY_1..N`) |
| Google OAuth 🔒 | console.cloud.google.com | **только Supabase** (Auth → Providers) |

> 🔒 = секрет, никогда не коммить в git и не давай префикс `VITE_`.
> Файл `.env.local` уже в `.gitignore` — не попадёт в репозиторий.
