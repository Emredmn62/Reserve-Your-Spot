using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public class BookingService : IBookingService
{
    private readonly SupabaseService _supabase;
    private readonly IBusinessService _businessService;

    public BookingService(SupabaseService supabase, IBusinessService businessService)
    {
        _supabase = supabase;
        _businessService = businessService;
    }

    public async Task<List<TimeSlot>> GetAvailableSlotsAsync(
        string businessId, string? staffId, DateTime date, int durationMinutes)
    {
        try
        {
            // Get business opening hours
            var business = await _businessService.GetBusinessByIdAsync(businessId);
            var dayName = date.DayOfWeek.ToString().ToLower();
            var openTime = TimeSpan.FromHours(9);
            var closeTime = TimeSpan.FromHours(18);

            if (business?.OpeningHours != null && business.OpeningHours.TryGetValue(dayName, out var hours))
            {
                var parts = hours.Split('-');
                if (parts.Length == 2)
                {
                    if (TimeSpan.TryParse(parts[0].Trim(), out var o)) openTime = o;
                    if (TimeSpan.TryParse(parts[1].Trim(), out var c)) closeTime = c;
                }
            }

            // Get existing bookings for that day
            var dateStart = date.Date.ToString("o");
            var dateEnd = date.Date.AddDays(1).ToString("o");
            var filter = staffId != null
                ? $"business_id=eq.{businessId}&staff_id=eq.{staffId}&start_time=gte.{dateStart}&start_time=lt.{dateEnd}&select=*"
                : $"business_id=eq.{businessId}&start_time=gte.{dateStart}&start_time=lt.{dateEnd}&select=*";
            var existingBookings = await _supabase.GetListAsync<Booking>("bookings", filter);

            var slots = new List<TimeSlot>();
            var current = date.Date + openTime;
            var end = date.Date + closeTime;
            var now = DateTime.Now;

            while (current + TimeSpan.FromMinutes(durationMinutes) <= end)
            {
                var slotEnd = current.AddMinutes(durationMinutes);
                var isBooked = existingBookings.Any(b =>
                    b.Status != BookingStatus.Cancelled &&
                    current < b.EndTime && slotEnd > b.StartTime);

                var isPast = current <= now;
                var isLastMinute = !isPast && (current - now).TotalHours <= 2;

                slots.Add(new TimeSlot
                {
                    DateTime = current,
                    IsAvailable = !isBooked && !isPast,
                    StaffId = staffId,
                    IsLastMinute = isLastMinute && !isBooked && !isPast
                });

                current = current.AddMinutes(30); // 30-min intervals
            }

            return slots;
        }
        catch { return new(); }
    }

    public async Task<Booking?> CreateBookingAsync(Booking booking)
    {
        try { return await _supabase.InsertAsync<Booking>("bookings", booking); }
        catch { return null; }
    }

    public async Task<List<Booking>> GetCustomerBookingsAsync(string customerId)
    {
        try
        {
            return await _supabase.GetListAsync<Booking>(
                "bookings", $"customer_id=eq.{customerId}&select=*&order=start_time.desc");
        }
        catch { return new(); }
    }

    public async Task<List<Booking>> GetBusinessBookingsAsync(string businessId, DateTime? date = null)
    {
        try
        {
            var filter = $"business_id=eq.{businessId}&select=*&order=start_time.asc";
            if (date.HasValue)
            {
                var start = date.Value.Date.ToString("o");
                var end = date.Value.Date.AddDays(1).ToString("o");
                filter += $"&start_time=gte.{start}&start_time=lt.{end}";
            }
            return await _supabase.GetListAsync<Booking>("bookings", filter);
        }
        catch { return new(); }
    }

    public async Task<bool> CancelBookingAsync(string bookingId, string reason)
    {
        try
        {
            await _supabase.UpdateAsync("bookings", $"id=eq.{bookingId}",
                new { status = "cancelled", cancellation_reason = reason });
            return true;
        }
        catch { return false; }
    }

    public async Task<bool> ConfirmBookingAsync(string bookingId)
    {
        try
        {
            await _supabase.UpdateAsync("bookings", $"id=eq.{bookingId}", new { status = "confirmed" });
            return true;
        }
        catch { return false; }
    }

    public async Task<bool> MarkNoShowAsync(string bookingId)
    {
        try
        {
            await _supabase.UpdateAsync("bookings", $"id=eq.{bookingId}", new { status = "no_show" });
            return true;
        }
        catch { return false; }
    }

    public async Task<bool> CompleteBookingAsync(string bookingId)
    {
        try
        {
            await _supabase.UpdateAsync("bookings", $"id=eq.{bookingId}", new { status = "completed" });
            return true;
        }
        catch { return false; }
    }
}
