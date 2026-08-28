using System.Text.Json;
using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public class PaymentService : IPaymentService
{
    private readonly SupabaseService _supabase;

    public PaymentService(SupabaseService supabase)
    {
        _supabase = supabase;
    }

    public async Task<string?> CreatePaymentIntentAsync(
        decimal amount, string currency, string bookingId, string customerId)
    {
        try
        {
            // Call Supabase Edge Function which wraps Stripe
            var payload = new
            {
                amount = (int)(amount * 100), // Stripe expects pence
                currency,
                booking_id = bookingId,
                customer_id = customerId
            };
            var result = await _supabase.CallFunctionAsync("create-payment-intent", payload);
            if (result == null) return null;
            var json = JsonDocument.Parse(result);
            return json.RootElement.TryGetProperty("client_secret", out var cs) ? cs.GetString() : null;
        }
        catch
        {
            return null;
        }
    }

    public async Task<Payment?> RecordPaymentAsync(Payment payment)
    {
        try { return await _supabase.InsertAsync<Payment>("payments", payment); }
        catch { return null; }
    }

    public async Task<List<Payment>> GetPaymentsForBookingAsync(string bookingId)
    {
        try { return await _supabase.GetListAsync<Payment>("payments", $"booking_id=eq.{bookingId}&select=*"); }
        catch { return new(); }
    }
}
