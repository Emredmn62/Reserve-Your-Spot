using System.Text.Json;
using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

/// <summary>
/// Calls the Supabase Edge Functions in /supabase/functions, which hold the
/// Stripe secret key and do the actual talking to Stripe. See STRIPE_SETUP.md.
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly SupabaseService _supabase;

    public PaymentService(SupabaseService supabase)
    {
        _supabase = supabase;
    }

    public async Task<string?> CreateBookingCheckoutAsync(Booking pendingBooking)
    {
        try
        {
            var result = await _supabase.CallFunctionAsync("create-booking-checkout", new
            {
                booking_id = pendingBooking.Id
            });
            return ExtractUrl(result);
        }
        catch { return null; }
    }

    public async Task<string?> CreateSubscriptionCheckoutAsync(string businessId)
    {
        try
        {
            var result = await _supabase.CallFunctionAsync("create-subscription-checkout", new
            {
                business_id = businessId
            });
            return ExtractUrl(result);
        }
        catch { return null; }
    }

    public async Task<string?> CreateConnectOnboardingLinkAsync(string businessId)
    {
        try
        {
            var result = await _supabase.CallFunctionAsync("create-connect-account", new
            {
                business_id = businessId
            });
            return ExtractUrl(result);
        }
        catch { return null; }
    }

    public async Task<List<Payment>> GetPaymentsForBookingAsync(string bookingId)
    {
        try { return await _supabase.GetListAsync<Payment>("payments", $"booking_id=eq.{bookingId}&select=*"); }
        catch { return new(); }
    }

    private static string? ExtractUrl(string? functionResponseJson)
    {
        if (string.IsNullOrEmpty(functionResponseJson)) return null;
        try
        {
            var json = JsonDocument.Parse(functionResponseJson);
            return json.RootElement.TryGetProperty("url", out var url) ? url.GetString() : null;
        }
        catch { return null; }
    }
}
