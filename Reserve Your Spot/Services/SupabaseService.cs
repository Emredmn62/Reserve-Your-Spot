using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Reserve_Your_Spot.Constants;

namespace Reserve_Your_Spot.Services;

public class SupabaseService
{
    private readonly HttpClient _httpClient;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    public string? AccessToken { get; set; }

    public SupabaseService()
    {
        _httpClient = new HttpClient();
        if (Uri.TryCreate(AppConstants.SupabaseUrl, UriKind.Absolute, out var baseUri))
            _httpClient.BaseAddress = baseUri;
        _httpClient.DefaultRequestHeaders.Add("apikey", AppConstants.SupabaseAnonKey);
    }

    private void SetAuthHeader()
    {
        _httpClient.DefaultRequestHeaders.Remove("Authorization");
        if (!string.IsNullOrEmpty(AccessToken))
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {AccessToken}");
    }

    public async Task<List<T>> GetListAsync<T>(string table, string? query = null)
    {
        try
        {
            SetAuthHeader();
            var url = $"/rest/v1/{table}?{query ?? "select=*"}";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<List<T>>(JsonOptions) ?? new();
        }
        catch
        {
            return new();
        }
    }

    public async Task<T?> GetSingleAsync<T>(string table, string query)
    {
        try
        {
            SetAuthHeader();
            var url = $"/rest/v1/{table}?{query}&limit=1";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("Accept", "application/vnd.pgrst.object+json");
            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode) return default;
            return await response.Content.ReadFromJsonAsync<T>(JsonOptions);
        }
        catch
        {
            return default;
        }
    }

    public async Task<T?> InsertAsync<T>(string table, object data)
    {
        try
        {
            SetAuthHeader();
            var json = JsonSerializer.Serialize(data, JsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var request = new HttpRequestMessage(HttpMethod.Post, $"/rest/v1/{table}");
            request.Content = content;
            request.Headers.Add("Prefer", "return=representation");
            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var list = await response.Content.ReadFromJsonAsync<List<T>>(JsonOptions);
            if (list is null || list.Count == 0) return default;
            return list[0];
        }
        catch
        {
            return default;
        }
    }

    public async Task UpdateAsync(string table, string filter, object data)
    {
        try
        {
            SetAuthHeader();
            var json = JsonSerializer.Serialize(data, JsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PatchAsync($"/rest/v1/{table}?{filter}", content);
            response.EnsureSuccessStatusCode();
        }
        catch { /* swallow */ }
    }

    public async Task DeleteAsync(string table, string filter)
    {
        try
        {
            SetAuthHeader();
            var response = await _httpClient.DeleteAsync($"/rest/v1/{table}?{filter}");
            response.EnsureSuccessStatusCode();
        }
        catch { /* swallow */ }
    }

    public async Task<string?> SignUpAsync(string email, string password, Dictionary<string, object> metadata)
    {
        try
        {
            var payload = new { email, password, data = metadata };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/auth/v1/signup", content);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            return result.TryGetProperty("access_token", out var token) ? token.GetString() : null;
        }
        catch
        {
            return null;
        }
    }

    public async Task<(string? token, string? userId)> SignInAsync(string email, string password)
    {
        try
        {
            var payload = new { email, password };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("/auth/v1/token?grant_type=password", content);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<JsonElement>();
            var token = result.TryGetProperty("access_token", out var t) ? t.GetString() : null;
            var userId = result.TryGetProperty("user", out var u) && u.TryGetProperty("id", out var id)
                ? id.GetString() : null;
            return (token, userId);
        }
        catch
        {
            return (null, null);
        }
    }

    public async Task<string?> CallFunctionAsync(string functionName, object payload)
    {
        try
        {
            SetAuthHeader();
            var json = JsonSerializer.Serialize(payload, JsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"/functions/v1/{functionName}", content);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadAsStringAsync();
        }
        catch
        {
            return null;
        }
    }
}

/*
-- ============================================================
-- BOOKLOCAL DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  icon_emoji text,
  sort_order int default 0
);

-- users (extends Supabase auth.users)
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

-- businesses
create table businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  category_id uuid references categories(id),
  logo_url text,
  cover_image_url text,
  gallery_urls text[] default '{}',
  address text,
  latitude double precision,
  longitude double precision,
  phone text,
  instagram_url text,
  website_url text,
  whatsapp_number text,
  opening_hours jsonb default '{}',
  cancellation_policy text,
  deposit_percentage decimal default 20,
  is_approved boolean default false,
  is_featured boolean default false,
  boost_expires_at timestamptz,
  subscription_plan text default 'free',
  rating double precision default 0,
  total_reviews int default 0,
  created_at timestamptz default now(),
  -- Payments (Stripe Connect) - a business only goes live (is_approved=true)
  -- once subscription_status='active' AND stripe_connect_onboarded=true.
  -- Both flags are flipped by supabase/functions/stripe-webhook, not the app.
  subscription_status text default 'none', -- none | active | past_due | canceled
  subscription_renews_at timestamptz,
  stripe_connect_account_id text,
  stripe_connect_onboarded boolean default false
);
create index on businesses(latitude, longitude);
create index on businesses(category_id);
create index on businesses(is_approved, is_featured);
create unique index on businesses(stripe_connect_account_id) where stripe_connect_account_id is not null;

-- Invite-only onboarding: one code redeems one business listing.
create table referral_codes (
  code text primary key,
  issued_to text,
  used_by_business_id uuid references businesses(id),
  created_at timestamptz default now(),
  used_at timestamptz
);

-- services
create table services (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes int not null,
  price decimal not null,
  deposit_amount decimal not null default 0,
  category_tag text,
  is_active boolean default true
);
create index on services(business_id);

-- staff
create table staff (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  role text,
  photo_url text,
  bio text,
  working_hours jsonb default '{}',
  days_off date[] default '{}',
  is_active boolean default true
);
create index on staff(business_id);

-- bookings
create table bookings (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id),
  service_id uuid references services(id),
  staff_id uuid references staff(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text default 'pending',
  total_price decimal not null,
  deposit_amount decimal not null default 0,
  deposit_paid boolean default false,
  remaining_balance decimal not null default 0,
  notes text,
  cancellation_reason text,
  is_manual boolean default false,
  created_at timestamptz default now()
);
create index on bookings(customer_id, start_time);
create index on bookings(business_id, start_time);
create index on bookings(staff_id, start_time);

-- payments
create table payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id),
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id),
  amount decimal not null,
  currency text default 'gbp',
  stripe_payment_intent_id text,
  status text default 'pending',
  type text default 'deposit',
  platform_fee decimal default 0,
  business_amount decimal default 0,
  created_at timestamptz default now()
);

-- reviews
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id),
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id),
  rating int check(rating between 1 and 5),
  comment text,
  is_verified boolean default true,
  created_at timestamptz default now(),
  unique(booking_id)
);
create index on reviews(business_id);

-- favourites
create table favourites (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id),
  created_at timestamptz default now(),
  unique(customer_id, business_id)
);

-- loyalty_cards
create table loyalty_cards (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.users(id),
  business_id uuid references businesses(id),
  total_stamps int default 0,
  required_stamps int default 5,
  reward_description text,
  last_stamped_at timestamptz,
  unique(customer_id, business_id)
);

-- notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  title text not null,
  body text not null,
  type text,
  reference_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);
create index on notifications(user_id, is_read);

-- RLS Policies
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

create policy "Users read own" on public.users for select using (auth.uid() = id);
create policy "Users update own" on public.users for update using (auth.uid() = id);
create policy "Users insert own" on public.users for insert with check (auth.uid() = id);

create policy "Public read approved businesses" on businesses for select using (is_approved = true);
create policy "Owner manage business" on businesses for all using (auth.uid() = owner_id);

create policy "Public read services" on services for select using (true);
create policy "Owner manage services" on services for all using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);

create policy "Public read staff" on staff for select using (true);
create policy "Owner manage staff" on staff for all using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);

create policy "Customer read own bookings" on bookings for select using (auth.uid() = customer_id);
create policy "Business read own bookings" on bookings for select using (
  exists(select 1 from businesses where id = business_id and owner_id = auth.uid())
);
create policy "Customer create booking" on bookings for insert with check (auth.uid() = customer_id);
create policy "Customer update own booking" on bookings for update using (auth.uid() = customer_id);

create policy "Public read reviews" on reviews for select using (true);
create policy "Customer write review" on reviews for insert with check (auth.uid() = customer_id);

create policy "Customer manage favourites" on favourites for all using (auth.uid() = customer_id);

create policy "User read own notifications" on notifications for select using (auth.uid() = user_id);
*/
