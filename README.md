# 🎓 LearnHub — Plataforma de Cursos

Site de cursos online com Next.js, Supabase, Netlify Functions, YouTube e Stripe.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 + Tailwind CSS |
| Backend | Netlify Functions (serverless) |
| Banco + Auth | Supabase (PostgreSQL + RLS) |
| Vídeos | YouTube (unlisted) |
| Pagamentos | Stripe |
| Deploy | Netlify (gratuito) |

---

## Setup passo a passo

### 1. Clone e instale

```bash
git clone <seu-repo>
cd cursosapp
npm install
```

### 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

### 3. Supabase

1. Crie projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e cole o conteúdo de `supabase-schema.sql`
3. Copie a **URL** e as **chaves** do projeto para o `.env.local`

### 4. Stripe

1. Crie conta em [stripe.com](https://stripe.com)
2. Copie as chaves do dashboard para o `.env.local`
3. Configure o webhook apontando para:
   `https://SEU-SITE.netlify.app/.netlify/functions/stripe-webhook`
4. Evento necessário: `checkout.session.completed`

### 5. Deploy no Netlify

1. Suba o projeto para o GitHub
2. No Netlify: **Add new site → Import from Git**
3. Configure as variáveis de ambiente no painel do Netlify
4. O deploy acontece automaticamente

### 6. Rodando localmente

```bash
npm run dev
```

Para testar Netlify Functions localmente:

```bash
npx netlify dev
```

---

## Estrutura do projeto

```
cursosapp/
├── netlify/
│   └── functions/
│       ├── get-lesson-video.js      # Protege URL do YouTube
│       ├── mark-lesson-complete.js  # Progresso + certificado
│       ├── create-checkout.js       # Stripe checkout
│       └── stripe-webhook.js        # Confirma pagamento
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home
│   │   ├── login/page.tsx           # Login/Cadastro
│   │   ├── dashboard/page.tsx       # Área do aluno
│   │   ├── courses/[slug]/page.tsx  # Página do curso
│   │   └── learn/[slug]/page.tsx    # Player de aulas
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── ui/CourseCard.tsx
│   │   └── player/LessonPlayer.tsx  # YouTube + progresso
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts            # Supabase browser
│   │       └── server.ts            # Supabase server
│   └── types/
│       └── database.ts              # Tipos TypeScript
├── supabase-schema.sql              # Schema + RLS completo
├── netlify.toml
└── .env.example
```

---

## Como adicionar cursos

1. No Supabase, abra o **Table Editor**
2. Insira um registro em `profiles` com `role = 'instructor'`
3. Crie o curso em `courses` com `is_published = false`
4. Adicione módulos em `modules` e aulas em `lessons`
5. Para cada aula, coloque o **YouTube Video ID** (parte depois de `?v=`) no campo `youtube_video_id`
6. Marque `is_preview = true` na primeira aula de cada módulo
7. Mude `is_published = true` quando estiver pronto

---

## Segurança dos vídeos YouTube

- Todos os vídeos devem ser **Não listados** (unlisted) no YouTube
- O `youtube_video_id` nunca aparece no frontend diretamente
- A função `get-lesson-video` verifica a matrícula antes de retornar o ID
- Aulas com `is_preview = true` são a exceção (preview gratuito)

---

## Próximos passos sugeridos

- [ ] Página de detalhes do curso com ementa
- [ ] Player de aulas completo com sidebar
- [ ] Quiz por IA com Gemini
- [ ] Chatbot de dúvidas
- [ ] Painel do instrutor
- [ ] Geração de certificado em PDF
- [ ] SEO: sitemap.xml + JSON-LD
