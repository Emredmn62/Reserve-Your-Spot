import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/AppConstants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/*
============================================================
BOOKLOCAL — SUPABASE SQL SCHEMA
Run this in your Supabase SQL Editor to set up the database.
============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============ CATEGORIES ============
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  emoji text,
  sort_order int default 0
);

insert into categories (name, slug, emoji, sort_order) values
  ('Barbers', 'barbers', '✂️', 1),
  ('Hair Salons', 'hair', '💇', 2),
  ('Nail Shops', 'nails', '💅', 3),
  ('Beauty Clinics', 'beauty', '✨', 4),
  ('Lash Technicians', 'lash', '👁️', 5),
  ('Personal Trainers', 'pt', '💪', 6),
  ('Tutors', 'tutors', '📚', 7),
  ('Massage', 'massage', '🧖', 8),
  ('Car Wash', 'carwash', '🚗', 9),
  ('Cleaning', 'cleaning', '🧹', 10),
  ('Mechanics', 'mechanics', '🔧', 11);

-- ============ USERS ============
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone_number text,
  avatar_url text,
  is_business_owner boolean default false,
  fcm_token text,
  created_at timestamptz default now()
);

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, is_business_owner)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'is_business_owner')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============ BUSINESSES ============
create table businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text default '',
  category_id uuid references categories(id),
  logo_url text,
  cover_image_url text,
  gallery_urls text[] default '{}',
  address text default '',
  latitude double precision default 0,
  longitude double precision default 0,
  phone text default '',
  instagram_url text,
  website_url text,
  whatsapp_number text,
  opening_hours jsonb default '{}',
  cancellation_policy text default 'Free cancellation up to 24 hours before appointment.',
  deposit_percentage decimal default 20,
  brand_color text default '#C9A84C',
  is_approved boolean default false,
  is_featured boolean default false,
  boost_expires_at timestamptz,
  subscription_plan text default 'free',
  rating double precision default 0,
  total_reviews int default 0,
  created_at timestamptz default now()
);

create index on businesses (latitude, longitude);
create index on businesses (category_id);
create index on businesses (is_approved, is_featured);
create index on businesses (owner_id);

-- ============ SERVICES ============
create table services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  name text not null,
  description text default '',
  duration_minutes int not null,
  price decimal not null,
  deposit_amount decimal not null default 0,
  category_tag text,
  is_active boolean default true
);

create index on services (business_id);

-- ============ STAFF ============
create table staff (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade not null,
  name text not null,
  role text default '',
  photo_url text,
  bio text default '',
  working_hours jsonb default '{"Mon":{"start":"09:00","end":"17:00","is_working":true},"Tue":{"start":"09:00","end":"17:00","is_working":true},"Wed":{"start":"09:00","end":"17:00","is_working":true},"Thu":{"start":"09:00","end":"17:00","is_working":true},"Fri":{"start":"09:00","end":"17:00","is_working":true},"Sat":{"start":"10:00","end":"16:00","is_working":true},"Sun":{"start":"00:00","end":"00:00","is_working":false}}',
  days_off text[] default '{}',
  is_active boolean default true
);

create index on staff (business_id);

-- ============ BOOKINGS ============
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id) not null,
  service_id uuid references services(id) not null,
  staff_id uuid references staff(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text default 'pending' check(status in ('pending','confirmed','completed','cancelled','no_show')),
  total_price decimal not null,
  deposit_amount decimal not null default 0,
  deposit_paid boolean default false,
  remaining_balance decimal not null default 0,
  notes text,
  cancellation_reason text,
  is_manual boolean default false,
  created_at timestamptz default now()
);

create index on bookings (customer_id, start_time);
create index on bookings (business_id, start_time);
create index on bookings (staff_id, start_time);
create index on bookings (status);

-- Prevent double-booking trigger
create or replace function check_double_booking()
returns trigger as $$
begin
  if exists (
    select 1 from bookings
    where staff_id = new.staff_id
      and id != new.id
      and status not in ('cancelled', 'no_show')
      and (start_time, end_time) overlaps (new.start_time, new.end_time)
  ) then
    raise exception 'This time slot is already booked.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger prevent_double_booking
  before insert or update on bookings
  for each row when (new.staff_id is not null)
  execute function check_double_booking();

-- ============ PAYMENTS ============
create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade not null,
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id),
  amount decimal not null,
  currency text default 'gbp',
  stripe_payment_intent_id text,
  status text default 'pending' check(status in ('pending','succeeded','refunded','failed')),
  type text default 'deposit' check(type in ('deposit','full','subscription')),
  platform_fee decimal default 0,
  business_amount decimal default 0,
  created_at timestamptz default now()
);

create index on payments (booking_id);
create index on payments (business_id);
create index on payments (stripe_payment_intent_id);

-- ============ REVIEWS ============
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) unique not null,
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id),
  rating int check(rating between 1 and 5),
  comment text default '',
  is_verified boolean default true,
  created_at timestamptz default now()
);

create index on reviews (business_id);
create index on reviews (customer_id);

-- Auto-update business rating
create or replace function update_business_rating()
returns trigger as $$
begin
  update businesses set
    rating = (select avg(rating) from reviews where business_id = new.business_id),
    total_reviews = (select count(*) from reviews where business_id = new.business_id)
  where id = new.business_id;
  return new;
end;
$$ language plpgsql;

create trigger after_review_insert
  after insert or update on reviews
  for each row execute function update_business_rating();

-- ============ FAVOURITES ============
create table favourites (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.users(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  created_at timestamptz default now(),
  unique(customer_id, business_id)
);

-- ============ LOYALTY CARDS ============
create table loyalty_cards (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.users(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  total_stamps int default 0,
  required_stamps int default 5,
  reward_description text default '',
  last_stamped_at timestamptz,
  unique(customer_id, business_id)
);

-- ============ NOTIFICATIONS ============
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text,
  reference_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index on notifications (user_id, is_read);

-- ============ ADMIN USERS ============
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text default 'moderator' check(role in ('super_admin', 'moderator')),
  created_at timestamptz default now()
);

-- ============ ROW LEVEL SECURITY ============
alter table public.users enable row level security;
alter table businesses enable row level security;
alter table services enable row level security;
alter table staff enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table reviews enable row level security;
alter table favourites enable row level security;
alter table loyalty_cards enable row level security;
alter table notifications enable row level security;

-- Users
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);

-- Businesses (public read of approved, owner full control)
create policy "businesses_public_read" on businesses for select using (is_approved = true);
create policy "businesses_owner_all" on businesses for all using (auth.uid() = owner_id);

-- Services (public read, owner manage)
create policy "services_public_read" on services for select using (true);
create policy "services_owner_manage" on services for all using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);

-- Staff (public read, owner manage)
create policy "staff_public_read" on staff for select using (true);
create policy "staff_owner_manage" on staff for all using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);

-- Bookings
create policy "bookings_customer_read" on bookings for select using (auth.uid() = customer_id);
create policy "bookings_business_read" on bookings for select using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);
create policy "bookings_customer_insert" on bookings for insert with check (auth.uid() = customer_id);
create policy "bookings_customer_update" on bookings for update using (auth.uid() = customer_id);
create policy "bookings_business_update" on bookings for update using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);

-- Payments
create policy "payments_customer_read" on payments for select using (auth.uid() = customer_id);
create policy "payments_business_read" on payments for select using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);

-- Reviews
create policy "reviews_public_read" on reviews for select using (true);
create policy "reviews_customer_insert" on reviews for insert with check (
  auth.uid() = customer_id and
  exists(select 1 from bookings where id = booking_id and customer_id = auth.uid() and status = 'completed')
);

-- Favourites
create policy "favourites_own" on favourites for all using (auth.uid() = customer_id);

-- Loyalty
create policy "loyalty_customer_read" on loyalty_cards for select using (auth.uid() = customer_id);

-- Notifications
create policy "notifications_own" on notifications for all using (auth.uid() = user_id);

-- ============ STORAGE BUCKETS ============
-- Create these in the Supabase Storage UI:
-- "business-logos"    (public)
-- "business-covers"   (public)
-- "business-gallery"  (public)
-- "staff-photos"      (public)
-- "user-avatars"      (public)

============================================================
*/
