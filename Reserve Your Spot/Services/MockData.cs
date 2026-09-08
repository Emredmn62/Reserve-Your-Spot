using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

/// <summary>
/// In-memory store + mock service implementations so the app runs without a
/// Supabase / Stripe backend.
///
/// It starts EMPTY — no businesses, no bookings — so it behaves like a fresh
/// production install. A signed-in business owner can create their own listing
/// (it starts as Pending / not approved). Nothing persists past app restart and
/// nothing is shared between devices — that needs the real backend. Swap these
/// registrations in MauiProgram for the real services once Supabase + Stripe
/// are configured.
/// </summary>
public static class MockStore
{
    public const string DemoUserId = "demo-user";

    public static readonly User DemoUser = new()
    {
        Id = DemoUserId,
        Email = "you@example.com",
        FullName = "Demo User",
        PhoneNumber = "+44 7700 900000",
        IsBusinessOwner = false,
        CreatedAt = DateTime.Now
    };

    // Empty — ready for real sign-ups.
    public static readonly List<Business> Businesses = new();
    public static readonly List<Service> Services = new();
    public static readonly List<Staff> Staff = new();
    public static readonly List<Review> Reviews = new();
    public static readonly HashSet<string> Favourites = new();
    public static readonly List<LoyaltyCard> LoyaltyCards = new();
    public static readonly List<Booking> Bookings = new();
    public static readonly List<Payment> Payments = new();

    // Invite codes you hand out. One code = one business.
    // Replace/extend with your real codes (in production these live in the DB).
    public static readonly List<ReferralCode> ReferralCodes = new()
    {
        new() { Code = "FOUNDER-001", IssuedTo = "sample", CreatedAt = DateTime.Now },
        new() { Code = "FOUNDER-002", IssuedTo = "sample", CreatedAt = DateTime.Now },
        new() { Code = "FOUNDER-003", IssuedTo = "sample", CreatedAt = DateTime.Now },
    };
}

public class MockAuthService : IAuthService
{
    private bool _isBusinessOwner;

    public bool IsLoggedIn => true;
    public string? CurrentUserId => MockStore.DemoUserId;
    public bool IsBusinessOwner => _isBusinessOwner;

    public Task<bool> SignUpAsync(string email, string password, string fullName, string phone, bool isBusinessOwner)
    {
        _isBusinessOwner = isBusinessOwner;
        return Task.FromResult(true);
    }

    public Task<bool> SignInAsync(string email, string password)
    {
        // Any credentials work in the demo. "biz@" prefix signs in as a business owner.
        _isBusinessOwner = email.TrimStart().StartsWith("biz", StringComparison.OrdinalIgnoreCase);
        return Task.FromResult(true);
    }

    public Task SignOutAsync()
    {
        _isBusinessOwner = false;
        return Task.CompletedTask;
    }

    public Task<User?> GetCurrentUserAsync()
    {
        var user = MockStore.DemoUser;
        user.IsBusinessOwner = _isBusinessOwner;
        return Task.FromResult<User?>(user);
    }
}

public class MockBusinessService : IBusinessService
{
    // Customers only ever see approved businesses.
    private static IEnumerable<Business> Live => MockStore.Businesses.Where(b => b.IsApproved);

    public Task<List<Business>> GetNearbyBusinessesAsync(double lat, double lng, double radiusKm = 10)
        => Task.FromResult(Live.OrderBy(b => b.DistanceKm ?? 0).ToList());

    public Task<List<Business>> GetFeaturedBusinessesAsync()
        => Task.FromResult(Live.Where(b => b.IsFeatured).ToList());

    public Task<List<Business>> SearchBusinessesAsync(string query, string? categorySlug = null)
    {
        var q = Live;
        if (!string.IsNullOrWhiteSpace(query))
            q = q.Where(b => b.Name.Contains(query, StringComparison.OrdinalIgnoreCase)
                          || b.Description.Contains(query, StringComparison.OrdinalIgnoreCase)
                          || (b.Category?.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false));
        if (!string.IsNullOrEmpty(categorySlug))
            q = q.Where(b => b.Category?.Slug == categorySlug);
        return Task.FromResult(q.ToList());
    }

    public Task<Business?> GetBusinessByIdAsync(string id)
        => Task.FromResult(MockStore.Businesses.FirstOrDefault(b => b.Id == id));

    // The owner sees their own listing even while it is Pending.
    public Task<Business?> GetBusinessByOwnerAsync(string ownerId)
        => Task.FromResult(MockStore.Businesses.FirstOrDefault(b => b.OwnerId == ownerId));

    public Task<List<Service>> GetServicesAsync(string businessId)
        => Task.FromResult(MockStore.Services.Where(s => s.BusinessId == businessId).ToList());

    public Task<List<Staff>> GetStaffAsync(string businessId)
        => Task.FromResult(MockStore.Staff.Where(s => s.BusinessId == businessId).ToList());

    public Task<List<Review>> GetReviewsAsync(string businessId)
        => Task.FromResult(MockStore.Reviews.Where(r => r.BusinessId == businessId)
                                            .OrderByDescending(r => r.CreatedAt).ToList());

    public Task<bool> ToggleFavouriteAsync(string customerId, string businessId)
    {
        if (!MockStore.Favourites.Remove(businessId)) MockStore.Favourites.Add(businessId);
        return Task.FromResult(MockStore.Favourites.Contains(businessId));
    }

    public Task<bool> IsFavouriteAsync(string customerId, string businessId)
        => Task.FromResult(MockStore.Favourites.Contains(businessId));

    public Task<List<Business>> GetFavouritesAsync(string customerId)
        => Task.FromResult(MockStore.Businesses.Where(b => MockStore.Favourites.Contains(b.Id)).ToList());

    public Task<Business?> CreateBusinessAsync(Business business)
    {
        business.Id = string.IsNullOrEmpty(business.Id) ? Guid.NewGuid().ToString() : business.Id;
        business.IsApproved = false;             // Pending until a subscription is active
        business.SubscriptionPlan = "pending";
        business.CreatedAt = DateTime.Now;
        MockStore.Businesses.Add(business);
        return Task.FromResult<Business?>(business);
    }

    public Task UpdateBusinessAsync(Business business) => Task.CompletedTask;

    public Task<Service?> AddServiceAsync(Service service)
    {
        service.Id = Guid.NewGuid().ToString();
        MockStore.Services.Add(service);
        return Task.FromResult<Service?>(service);
    }

    public Task UpdateServiceAsync(Service service) => Task.CompletedTask;

    public Task DeleteServiceAsync(string serviceId)
    {
        MockStore.Services.RemoveAll(s => s.Id == serviceId);
        return Task.CompletedTask;
    }

    public Task<Staff?> AddStaffAsync(Staff staff)
    {
        staff.Id = Guid.NewGuid().ToString();
        MockStore.Staff.Add(staff);
        return Task.FromResult<Staff?>(staff);
    }

    public Task UpdateStaffAsync(Staff staff) => Task.CompletedTask;

    public Task DeleteStaffAsync(string staffId)
    {
        MockStore.Staff.RemoveAll(s => s.Id == staffId);
        return Task.CompletedTask;
    }
}

public class MockBookingService : IBookingService
{
    public Task<List<TimeSlot>> GetAvailableSlotsAsync(string businessId, string? staffId, DateTime date, int durationMinutes)
    {
        var slots = new List<TimeSlot>();
        var start = date.Date.AddHours(9);
        var end = date.Date.AddHours(18);
        var now = DateTime.Now;
        var cursor = start;
        while (cursor.AddMinutes(durationMinutes) <= end)
        {
            var isPast = cursor <= now;
            var isBooked = MockStore.Bookings.Any(b =>
                b.BusinessId == businessId && b.Status != BookingStatus.Cancelled &&
                cursor < b.EndTime && cursor.AddMinutes(durationMinutes) > b.StartTime);
            slots.Add(new TimeSlot
            {
                DateTime = cursor,
                IsAvailable = !isPast && !isBooked,
                StaffId = staffId,
                IsLastMinute = !isPast && !isBooked && (cursor - now).TotalHours <= 3
            });
            cursor = cursor.AddMinutes(30);
        }
        return Task.FromResult(slots);
    }

    public Task<Booking?> CreateBookingAsync(Booking booking)
    {
        booking.Id = "bkg-" + Guid.NewGuid().ToString("N")[..8];
        booking.CreatedAt = DateTime.Now;
        booking.Business ??= MockStore.Businesses.FirstOrDefault(b => b.Id == booking.BusinessId);
        booking.Service ??= MockStore.Services.FirstOrDefault(s => s.Id == booking.ServiceId);
        booking.Staff ??= booking.StaffId != null ? MockStore.Staff.FirstOrDefault(s => s.Id == booking.StaffId) : null;
        booking.Customer ??= MockStore.DemoUser;
        booking.DepositPaid = true;
        MockStore.Bookings.Insert(0, booking);
        return Task.FromResult<Booking?>(booking);
    }

    public Task<List<Booking>> GetCustomerBookingsAsync(string customerId)
        => Task.FromResult(MockStore.Bookings.Where(b => b.CustomerId == customerId)
                                             .OrderByDescending(b => b.StartTime).ToList());

    public Task<List<Booking>> GetBusinessBookingsAsync(string businessId, DateTime? date = null)
    {
        var q = MockStore.Bookings.Where(b => b.BusinessId == businessId);
        if (date.HasValue) q = q.Where(b => b.StartTime.Date == date.Value.Date);
        return Task.FromResult(q.OrderBy(b => b.StartTime).ToList());
    }

    public Task<bool> CancelBookingAsync(string bookingId, string reason) => SetStatus(bookingId, BookingStatus.Cancelled, reason);
    public Task<bool> ConfirmBookingAsync(string bookingId) => SetStatus(bookingId, BookingStatus.Confirmed);
    public Task<bool> MarkNoShowAsync(string bookingId) => SetStatus(bookingId, BookingStatus.NoShow);
    public Task<bool> CompleteBookingAsync(string bookingId) => SetStatus(bookingId, BookingStatus.Completed);

    private static Task<bool> SetStatus(string bookingId, BookingStatus status, string? reason = null)
    {
        var b = MockStore.Bookings.FirstOrDefault(x => x.Id == bookingId);
        if (b == null) return Task.FromResult(false);
        b.Status = status;
        if (reason != null) b.CancellationReason = reason;
        return Task.FromResult(true);
    }
}

public class MockPaymentService : IPaymentService
{
    public Task<string?> CreatePaymentIntentAsync(decimal amount, string currency, string bookingId, string customerId)
        => Task.FromResult<string?>("pi_mock_" + Guid.NewGuid().ToString("N")[..12] + "_secret");

    public Task<Payment?> RecordPaymentAsync(Payment payment)
    {
        payment.Id = Guid.NewGuid().ToString();
        payment.Status = PaymentStatus.Succeeded;
        payment.CreatedAt = DateTime.Now;
        MockStore.Payments.Add(payment);
        return Task.FromResult<Payment?>(payment);
    }

    public Task<List<Payment>> GetPaymentsForBookingAsync(string bookingId)
        => Task.FromResult(MockStore.Payments.Where(p => p.BookingId == bookingId).ToList());
}

public class MockReferralService : IReferralService
{
    public Task<bool> IsValidAsync(string code)
    {
        var c = MockStore.ReferralCodes.FirstOrDefault(
            r => r.Code.Equals(code?.Trim(), StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(c is { IsAvailable: true });
    }

    public Task<bool> RedeemAsync(string code, string businessId)
    {
        var c = MockStore.ReferralCodes.FirstOrDefault(
            r => r.Code.Equals(code?.Trim(), StringComparison.OrdinalIgnoreCase));
        if (c is null || !c.IsAvailable) return Task.FromResult(false);
        c.UsedByBusinessId = businessId;
        c.UsedAt = DateTime.Now;
        return Task.FromResult(true);
    }
}
