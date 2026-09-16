using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

/// <summary>
/// Everything that touches Stripe. Card data never passes through the app —
/// every method here returns a Stripe-hosted Checkout/onboarding URL that the
/// app opens in the browser. Stripe tells the backend (a webhook) what
/// happened; the app finds out by polling the booking/business afterwards.
/// A null return means "nothing to open" (e.g. the mock implementation, which
/// completes instantly with no real payment).
/// </summary>
public interface IPaymentService
{
    /// <summary>Full payment for one booking. 5% becomes your application fee automatically.</summary>
    Task<string?> CreateBookingCheckoutAsync(Booking pendingBooking);

    /// <summary>The business's £/year listing fee.</summary>
    Task<string?> CreateSubscriptionCheckoutAsync(string businessId);

    /// <summary>Stripe Connect "Express" onboarding — bank details, ID, the works. Stripe hosts it.</summary>
    Task<string?> CreateConnectOnboardingLinkAsync(string businessId);

    Task<List<Payment>> GetPaymentsForBookingAsync(string bookingId);
}
