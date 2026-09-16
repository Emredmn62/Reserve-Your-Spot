using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public interface IBookingService
{
    Task<List<TimeSlot>> GetAvailableSlotsAsync(string businessId, string? staffId, DateTime date, int durationMinutes);
    Task<Booking?> CreateBookingAsync(Booking booking);
    Task<Booking?> GetBookingByIdAsync(string bookingId);
    Task<List<Booking>> GetCustomerBookingsAsync(string customerId);
    Task<List<Booking>> GetBusinessBookingsAsync(string businessId, DateTime? date = null);
    Task<bool> CancelBookingAsync(string bookingId, string reason);
    Task<bool> ConfirmBookingAsync(string bookingId);
    Task<bool> MarkNoShowAsync(string bookingId);
    Task<bool> CompleteBookingAsync(string bookingId);

    // Business "Block Time" - hours a business (or one staff member) marks
    // itself unavailable. Blocked slots show to customers exactly like a
    // booked slot: greyed out, no explanation given.
    Task<List<BlockedTime>> GetBlockedTimesAsync(string businessId);
    Task<BlockedTime?> CreateBlockedTimeAsync(BlockedTime block);
    Task<bool> DeleteBlockedTimeAsync(string blockId);
}
