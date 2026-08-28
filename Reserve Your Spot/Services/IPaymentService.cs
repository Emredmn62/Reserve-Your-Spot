using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public interface IPaymentService
{
    Task<string?> CreatePaymentIntentAsync(decimal amount, string currency, string bookingId, string customerId);
    Task<Payment?> RecordPaymentAsync(Payment payment);
    Task<List<Payment>> GetPaymentsForBookingAsync(string bookingId);
}
