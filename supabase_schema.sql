-- Create Modules Table
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image text,
  "showTitle" boolean default false,
  "lessonCount" integer default 0,
  order_index serial
);

-- Create Lessons Table
create table public.lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.modules(id) on delete cascade,
  title text not null,
  description text,
  "videoId" text,
  order_index serial
);

-- Create Students Table
create table public.students (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- Link to auth.users if needed
  name text,
  email text unique,
  progress integer default 0,
  "lastAccess" timestamptz default now()
);

-- Create Access Logs Table (for Heatmap)
create table public.access_logs (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.students(id) on delete cascade,
  access_time timestamptz default now()
);

-- Create Banner Config Table (Singleton pattern)
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

-- Enable Row Level Security (RLS)
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.students enable row level security;
alter table public.access_logs enable row level security;
alter table public.app_settings enable row level security;

-- Create Policies (Simplified for development - ALLOW ALL)
-- WARNING: In production, tighten these policies!

create policy "Enable all access for modules" on public.modules for all using (true);
create policy "Enable all access for lessons" on public.lessons for all using (true);
create policy "Enable all access for students" on public.students for all using (true);
create policy "Enable all access for access_logs" on public.access_logs for all using (true);
create policy "Enable all access for app_settings" on public.app_settings for all using (true);
