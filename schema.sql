-- براعم: محتوى الموقع واستفسارات أولياء الأمور.
-- لا تخزّن بيانات صحية أو معلومات حساسة تخص الأطفال هنا.

create table if not exists public.site_content (
  key text primary key,
  value text not null default '',
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id bigint generated always as identity primary key,
  parent_name text not null check (char_length(parent_name) between 1 and 80),
  phone text not null check (char_length(phone) between 5 and 30),
  message text not null check (char_length(message) between 1 and 1000),
  status text not null default 'new' check (status in ('new','done')),
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('baraem-media', 'baraem-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.site_admins where user_id = auth.uid());
$$;

alter table public.site_content enable row level security;
alter table public.site_admins enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "public reads published content" on public.site_content;
create policy "public reads published content" on public.site_content
  for select to anon, authenticated using (is_public or public.is_site_admin());
drop policy if exists "admins manage content" on public.site_content;
create policy "admins manage content" on public.site_content
  for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "admins read their own admin record" on public.site_admins;
create policy "admins read their own admin record" on public.site_admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "parents can submit enquiries" on public.enquiries;
create policy "parents can submit enquiries" on public.enquiries
  for insert to anon, authenticated with check (
    status = 'new' and char_length(trim(parent_name)) > 0 and
    char_length(trim(phone)) >= 5 and char_length(trim(message)) > 0
  );
drop policy if exists "admins read enquiries" on public.enquiries;
create policy "admins read enquiries" on public.enquiries
  for select to authenticated using (public.is_site_admin());
drop policy if exists "admins update enquiries" on public.enquiries;
create policy "admins update enquiries" on public.enquiries
  for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant select on public.site_admins to authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, update on public.enquiries to authenticated;
grant execute on function public.is_site_admin() to authenticated;

drop policy if exists "public reads Baraem images" on storage.objects;
create policy "public reads Baraem images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'baraem-media');
drop policy if exists "admins upload Baraem images" on storage.objects;
create policy "admins upload Baraem images" on storage.objects
  for insert to authenticated with check (bucket_id = 'baraem-media' and public.is_site_admin());
drop policy if exists "admins update Baraem images" on storage.objects;
create policy "admins update Baraem images" on storage.objects
  for update to authenticated using (bucket_id = 'baraem-media' and public.is_site_admin()) with check (bucket_id = 'baraem-media' and public.is_site_admin());
drop policy if exists "admins delete Baraem images" on storage.objects;
create policy "admins delete Baraem images" on storage.objects
  for delete to authenticated using (bucket_id = 'baraem-media' and public.is_site_admin());

insert into public.site_content (key, value, is_public) values
  ('hero_line1','بداية حلوة',true),
  ('hero_highlight','حكاية.',true),
  ('hero_text','في براعم، كل يوم مغامرة جديدة. بنوفّر لطفلك مساحة آمنة مليانة لعب واكتشاف، ونساعده يكبر واثق وسعيد.',true),
  ('hero_image','https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1100&q=85',true),
  ('program_title','مساحة تشجّع الفضول وتحتفل بكل خطوة',true),
  ('program_text','من أول سؤال «ليه؟» لحد أول رسمة وأول صداقة، بنكون جنب طفلك. أنشطتنا مناسبة لمرحلته وبتوازن بين اللعب والتعلم والراحة.',true),
  ('program_image','https://images.unsplash.com/photo-1564429238817-393bd4286b2d?auto=format&fit=crop&w=1000&q=85',true),
  ('whatsapp','',true),
  ('phone_display','0100 000 0000',true),
  ('address','أضيفي عنوان الحضانة هنا',true),
  ('email','hello@baraem.example',true),
  ('review_text','في براعم، نحتفل بكل خطوة صغيرة ونشارك الأهل أجمل تفاصيل رحلة طفلهم.',true),
  ('review_name','عيلة براعم',true)
on conflict (key) do nothing;

-- بعد إنشاء حساب الإدارة في Authentication > Users، شغّل هذا مرة واحدة
-- مع استبدال البريد بالبريد الذي أنشأته. لا تضع كلمة المرور في هذا الملف.
-- insert into public.site_admins (user_id)
-- select id from auth.users where email = 'ADMIN_EMAIL_HERE'
-- on conflict (user_id) do nothing;



