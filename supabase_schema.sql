-- Limpar tabelas existentes para resetar com IDs de texto
DROP TABLE IF EXISTS public.access_logs;
DROP TABLE IF EXISTS public.lessons;
DROP TABLE IF EXISTS public.students;
DROP TABLE IF EXISTS public.modules;
DROP TABLE IF EXISTS public.app_settings;

-- Create Modules Table
create table public.modules (
  id text primary key,
  title text not null,
  image text,
  "showTitle" boolean default false,
  "lessonCount" integer default 0,
  "releaseDays" integer default 0,
  order_index serial
);

-- Create Lessons Table
create table public.lessons (
  id text primary key,
  module_id text references public.modules(id) on delete cascade,
  title text not null,
  description text,
  "videoId" text,
  thumbnail text,
  attachments jsonb default '[]'::jsonb,
  "releaseDays" integer default 0,
  "is_link_lesson" boolean default false,
  "link_url" text,
  "link_text" text,
  "link_description" text,
  order_index serial
);

-- Create Students Table
create table public.students (
  id text primary key,
  user_id uuid, -- Mantido uuid para futura integração com Supabase Auth
  name text,
  email text unique,
  password_hash text,
  image text,
  status text default 'pending',
  progress integer default 0,
  "lastAccess" timestamptz default now(),
  "purchase_at" timestamptz default now(),
  "approved_at" timestamptz,
  "approved_by" text,
  "created_at" timestamptz default now(),
  "reset_token" text,
  "reset_expires" timestamptz
);

-- Create Access Logs Table
create table public.access_logs (
  id uuid default gen_random_uuid() primary key,
  student_id text references public.students(id) on delete cascade,
  access_time timestamptz default now()
);

-- Create App Settings Table
create table public.app_settings (
  key text primary key,
  value jsonb
);

-- Insert Default Banner Config
insert into public.app_settings (key, value)
values ('banner_config', '{
  "type": "image",
  "desktopMediaUrl": "/Capa-principal-banner-1.jpeg",
  "title": "",
  "showTitle": false,
  "description": "",
  "showDescription": false,
  "buttonText": "Saiba Mais",
  "buttonLink": "#",
  "showButton": false
}'::jsonb);

-- Enable RLS
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.students enable row level security;
alter table public.access_logs enable row level security;
alter table public.app_settings enable row level security;

-- Policies
create policy "Enable all access for modules" on public.modules for all using (true);
create policy "Enable all access for lessons" on public.lessons for all using (true);
create policy "Enable all access for students" on public.students for all using (true);
create policy "Enable all access for access_logs" on public.access_logs for all using (true);
create policy "Enable all access for app_settings" on public.app_settings for all using (true);
