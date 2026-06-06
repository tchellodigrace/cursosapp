-- =============================================
-- SCHEMA COMPLETO — Plataforma de Cursos
-- Cole no SQL Editor do Supabase
-- =============================================

-- Extensão para UUIDs
create extension if not exists "uuid-ossp";

-- -----------------------------------------------
-- PROFILES (extensão de auth.users)
-- -----------------------------------------------
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  full_name   text,
  avatar_url  text,
  role        text not null default 'student' check (role in ('student', 'instructor', 'admin')),
  created_at  timestamptz not null default now()
);

-- Cria perfil automaticamente ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------
-- COURSES
-- -----------------------------------------------
create table public.courses (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  description   text not null default '',
  thumbnail_url text,
  price_cents   integer not null default 0,
  instructor_id uuid references public.profiles(id) on delete cascade not null,
  is_published  boolean not null default false,
  category      text,
  level         text not null default 'beginner' check (level in ('beginner', 'intermediate', 'advanced')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_courses_slug on public.courses(slug);
create index idx_courses_published on public.courses(is_published);
create index idx_courses_instructor on public.courses(instructor_id);

-- -----------------------------------------------
-- MODULES
-- -----------------------------------------------
create table public.modules (
  id         uuid primary key default uuid_generate_v4(),
  course_id  uuid references public.courses(id) on delete cascade not null,
  title      text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_modules_course on public.modules(course_id);

-- -----------------------------------------------
-- LESSONS
-- -----------------------------------------------
create table public.lessons (
  id                uuid primary key default uuid_generate_v4(),
  module_id         uuid references public.modules(id) on delete cascade not null,
  title             text not null,
  description       text,
  youtube_video_id  text,  -- nunca exposto publicamente (exceto is_preview)
  duration_seconds  integer,
  position          integer not null default 0,
  is_preview        boolean not null default false,
  type              text not null default 'video' check (type in ('video', 'text', 'quiz')),
  created_at        timestamptz not null default now()
);

create index idx_lessons_module on public.lessons(module_id);

-- -----------------------------------------------
-- ENROLLMENTS
-- -----------------------------------------------
create table public.enrollments (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.profiles(id) on delete cascade not null,
  course_id         uuid references public.courses(id) on delete cascade not null,
  stripe_payment_id text,
  enrolled_at       timestamptz not null default now(),
  unique(user_id, course_id)
);

create index idx_enrollments_user on public.enrollments(user_id);
create index idx_enrollments_course on public.enrollments(course_id);

-- -----------------------------------------------
-- LESSON PROGRESS
-- -----------------------------------------------
create table public.lesson_progress (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.profiles(id) on delete cascade not null,
  lesson_id    uuid references public.lessons(id) on delete cascade not null,
  completed    boolean not null default false,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index idx_progress_user on public.lesson_progress(user_id);

-- -----------------------------------------------
-- CERTIFICATES
-- -----------------------------------------------
create table public.certificates (
  id        uuid primary key default uuid_generate_v4(),
  user_id   uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  issued_at timestamptz not null default now(),
  unique(user_id, course_id)
);

-- -----------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------

alter table public.profiles       enable row level security;
alter table public.courses        enable row level security;
alter table public.modules        enable row level security;
alter table public.lessons        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates   enable row level security;

-- PROFILES: usuário vê e edita apenas o próprio perfil
create policy "profiles: self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: self update" on public.profiles for update using (auth.uid() = id);

-- COURSES: qualquer um vê publicados; instrutor gerencia os seus
create policy "courses: public read"      on public.courses for select using (is_published = true);
create policy "courses: instructor manage" on public.courses for all
  using (auth.uid() = instructor_id);

-- MODULES: visíveis se o curso for publicado
create policy "modules: public read" on public.modules for select
  using (exists (
    select 1 from public.courses c
    where c.id = course_id and c.is_published = true
  ));
create policy "modules: instructor manage" on public.modules for all
  using (exists (
    select 1 from public.courses c
    where c.id = course_id and c.instructor_id = auth.uid()
  ));

-- LESSONS: preview livre; protegidas requerem matrícula
create policy "lessons: preview read" on public.lessons for select
  using (is_preview = true);
create policy "lessons: enrolled read" on public.lessons for select
  using (exists (
    select 1 from public.enrollments e
    join public.modules m on m.id = module_id
    where e.course_id = m.course_id and e.user_id = auth.uid()
  ));
create policy "lessons: instructor manage" on public.lessons for all
  using (exists (
    select 1 from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.instructor_id = auth.uid()
  ));

-- ENROLLMENTS: aluno vê as suas
create policy "enrollments: self read" on public.enrollments for select
  using (auth.uid() = user_id);

-- LESSON PROGRESS: aluno gerencia o próprio progresso
create policy "progress: self all" on public.lesson_progress for all
  using (auth.uid() = user_id);

-- CERTIFICATES: aluno vê os seus
create policy "certificates: self read" on public.certificates for select
  using (auth.uid() = user_id);
