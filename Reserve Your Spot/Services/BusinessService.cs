using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public class BusinessService : IBusinessService
{
    private readonly SupabaseService _supabase;

    public BusinessService(SupabaseService supabase)
    {
        _supabase = supabase;
    }

    public async Task<List<Business>> GetNearbyBusinessesAsync(double lat, double lng, double radiusKm = 10)
    {
        try
        {
            var all = await _supabase.GetListAsync<Business>("businesses", "select=*&is_approved=eq.true");
            foreach (var b in all)
                b.DistanceKm = CalculateDistance(lat, lng, b.Latitude, b.Longitude);
            return all.Where(b => b.DistanceKm <= radiusKm)
                      .OrderBy(b => b.DistanceKm)
                      .ToList();
        }
        catch { return new(); }
    }

    public async Task<List<Business>> GetFeaturedBusinessesAsync()
    {
        try
        {
            return await _supabase.GetListAsync<Business>(
                "businesses", "select=*&is_approved=eq.true&is_featured=eq.true&order=rating.desc&limit=10");
        }
        catch { return new(); }
    }

    public async Task<List<Business>> SearchBusinessesAsync(string query, string? categorySlug = null)
    {
        try
        {
            var filter = $"select=*&is_approved=eq.true&name=ilike.*{Uri.EscapeDataString(query)}*";
            var all = await _supabase.GetListAsync<Business>("businesses", filter);
            if (!string.IsNullOrEmpty(categorySlug))
                all = all.Where(b => b.Category?.Slug == categorySlug || b.CategoryId == categorySlug).ToList();
            return all;
        }
        catch { return new(); }
    }

    public async Task<Business?> GetBusinessByIdAsync(string id)
    {
        try { return await _supabase.GetSingleAsync<Business>("businesses", $"id=eq.{id}&select=*"); }
        catch { return null; }
    }

    public async Task<Business?> GetBusinessByOwnerAsync(string ownerId)
    {
        try { return await _supabase.GetSingleAsync<Business>("businesses", $"owner_id=eq.{ownerId}&select=*"); }
        catch { return null; }
    }

    public async Task<List<Service>> GetServicesAsync(string businessId)
    {
        try { return await _supabase.GetListAsync<Service>("services", $"business_id=eq.{businessId}&is_active=eq.true&select=*"); }
        catch { return new(); }
    }

    public async Task<List<Staff>> GetStaffAsync(string businessId)
    {
        try { return await _supabase.GetListAsync<Staff>("staff", $"business_id=eq.{businessId}&is_active=eq.true&select=*"); }
        catch { return new(); }
    }

    public async Task<List<Review>> GetReviewsAsync(string businessId)
    {
        try { return await _supabase.GetListAsync<Review>("reviews", $"business_id=eq.{businessId}&select=*&order=created_at.desc"); }
        catch { return new(); }
    }

    public async Task<bool> ToggleFavouriteAsync(string customerId, string businessId)
    {
        try
        {
            var isFav = await IsFavouriteAsync(customerId, businessId);
            if (isFav)
                await _supabase.DeleteAsync("favourites", $"customer_id=eq.{customerId}&business_id=eq.{businessId}");
            else
                await _supabase.InsertAsync<object>("favourites", new { customer_id = customerId, business_id = businessId });
            return !isFav;
        }
        catch { return false; }
    }

    public async Task<bool> IsFavouriteAsync(string customerId, string businessId)
    {
        try
        {
            var list = await _supabase.GetListAsync<object>(
                "favourites", $"customer_id=eq.{customerId}&business_id=eq.{businessId}&select=id");
            return list.Count > 0;
        }
        catch { return false; }
    }

    public async Task<List<Business>> GetFavouritesAsync(string customerId)
    {
        try
        {
            // Get favourite business IDs then load businesses
            var favs = await _supabase.GetListAsync<FavouriteRow>("favourites", $"customer_id=eq.{customerId}&select=business_id");
            var ids = favs.Select(f => f.BusinessId).ToList();
            var result = new List<Business>();
            foreach (var id in ids)
            {
                var b = await GetBusinessByIdAsync(id);
                if (b != null) result.Add(b);
            }
            return result;
        }
        catch { return new(); }
    }

    public async Task<Business?> CreateBusinessAsync(Business business)
    {
        try { return await _supabase.InsertAsync<Business>("businesses", business); }
        catch { return null; }
    }

    public async Task UpdateBusinessAsync(Business business)
    {
        try { await _supabase.UpdateAsync("businesses", $"id=eq.{business.Id}", business); }
        catch { /* swallow */ }
    }

    public async Task<Service?> AddServiceAsync(Service service)
    {
        try { return await _supabase.InsertAsync<Service>("services", service); }
        catch { return null; }
    }

    public async Task UpdateServiceAsync(Service service)
    {
        try { await _supabase.UpdateAsync("services", $"id=eq.{service.Id}", service); }
        catch { }
    }

    public async Task DeleteServiceAsync(string serviceId)
    {
        try { await _supabase.DeleteAsync("services", $"id=eq.{serviceId}"); }
        catch { }
    }

    public async Task<Staff?> AddStaffAsync(Staff staff)
    {
        try { return await _supabase.InsertAsync<Staff>("staff", staff); }
        catch { return null; }
    }

    public async Task UpdateStaffAsync(Staff staff)
    {
        try { await _supabase.UpdateAsync("staff", $"id=eq.{staff.Id}", staff); }
        catch { }
    }

    public async Task DeleteStaffAsync(string staffId)
    {
        try { await _supabase.DeleteAsync("staff", $"id=eq.{staffId}"); }
        catch { }
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
              + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2))
              * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;

    private class FavouriteRow { public string BusinessId { get; set; } = string.Empty; }
}
