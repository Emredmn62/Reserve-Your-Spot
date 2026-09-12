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

    // ---------------------------------------------------------------------
    // DEMO SEED DATA — flip this to false to go back to a clean, empty app
    // ready for real launch. True is for previewing what a "finished" app
    // looks like on the customer side: 5 example businesses, already
    // approved, each with a couple of feed posts.
    // ---------------------------------------------------------------------
    private const bool IncludeDemoSeedData = true;

    public static readonly List<Business> Businesses = IncludeDemoSeedData ? BuildDemoBusinesses() : new();
    public static readonly List<Service> Services = IncludeDemoSeedData ? BuildDemoServices() : new();
    public static readonly List<Staff> Staff = IncludeDemoSeedData ? BuildDemoStaff() : new();
    public static readonly List<Post> Posts = IncludeDemoSeedData ? BuildDemoPosts() : new();

    public static readonly List<Review> Reviews = new();
    public static readonly HashSet<string> Favourites = new();
    public static readonly List<LoyaltyCard> LoyaltyCards = new();
    public static readonly List<Booking> Bookings = new();
    public static readonly List<Payment> Payments = new();

    private static Category Cat(string slug) => Category.Defaults.First(c => c.Slug == slug);

    private static List<Business> BuildDemoBusinesses() => new()
    {
        new Business
        {
            Id = "demo-biz-1", OwnerId = "demo-owner-1", Name = "Fade Masters Barbershop", Slug = "fade-masters",
            Description = "Precision fades, hot-towel shaves and beard sculpting in the heart of Shoreditch.",
            CategoryId = "1", Category = Cat("barbers"),
            Address = "42 Rivington Street, Shoreditch, London EC2A 3AY",
            Latitude = 51.5265, Longitude = -0.0805, Phone = "+44 20 7946 0111",
            Rating = 4.8, TotalReviews = 214, IsApproved = true, IsFeatured = true,
            DepositPercentage = 20, SubscriptionPlan = "active"
        },
        new Business
        {
            Id = "demo-biz-2", OwnerId = "demo-owner-2", Name = "The Gilded Chair", Slug = "the-gilded-chair",
            Description = "A boutique salon for cut, colour and treatments in Soho.",
            CategoryId = "2", Category = Cat("hair"),
            Address = "9 Berwick Street, Soho, London W1F 0PP",
            Latitude = 51.5138, Longitude = -0.1360, Phone = "+44 20 7946 0122",
            Rating = 4.7, TotalReviews = 168, IsApproved = true, IsFeatured = true,
            DepositPercentage = 25, SubscriptionPlan = "active"
        },
        new Business
        {
            Id = "demo-biz-3", OwnerId = "demo-owner-3", Name = "Lux Nail Lounge", Slug = "lux-nail-lounge",
            Description = "Gel, BIAB and nail art by award-winning techs in Islington.",
            CategoryId = "3", Category = Cat("nails"),
            Address = "17 Upper Street, Islington, London N1 0PQ",
            Latitude = 51.5340, Longitude = -0.1030, Phone = "+44 20 7946 0133",
            Rating = 4.6, TotalReviews = 97, IsApproved = true, IsFeatured = false,
            DepositPercentage = 20, SubscriptionPlan = "active"
        },
        new Business
        {
            Id = "demo-biz-4", OwnerId = "demo-owner-4", Name = "Iron & Oak PT Studio", Slug = "iron-and-oak",
            Description = "Private personal training studio in Hackney. 1-to-1 and small-group coaching.",
            CategoryId = "6", Category = Cat("pt"),
            Address = "3 Morning Lane, Hackney, London E9 6ND",
            Latitude = 51.5460, Longitude = -0.0540, Phone = "+44 20 7946 0144",
            Rating = 4.9, TotalReviews = 76, IsApproved = true, IsFeatured = true,
            DepositPercentage = 30, SubscriptionPlan = "active"
        },
        new Business
        {
            Id = "demo-biz-5", OwnerId = "demo-owner-5", Name = "Serenity Massage Rooms", Slug = "serenity-massage",
            Description = "Deep tissue, sports and Swedish massage near Camden Lock.",
            CategoryId = "8", Category = Cat("massage"),
            Address = "88 Chalk Farm Road, Camden, London NW1 8AR",
            Latitude = 51.5430, Longitude = -0.1490, Phone = "+44 20 7946 0155",
            Rating = 4.5, TotalReviews = 52, IsApproved = true, IsFeatured = false,
            DepositPercentage = 20, SubscriptionPlan = "active"
        }
    };

    private static List<Service> BuildDemoServices() => new()
    {
        new() { Id = "demo-svc-1a", BusinessId = "demo-biz-1", Name = "Skin Fade", Description = "Bald or skin fade with a line-up.", DurationMinutes = 45, Price = 28m, DepositAmount = 6m },
        new() { Id = "demo-svc-1b", BusinessId = "demo-biz-1", Name = "Cut & Beard Combo", Description = "Full haircut plus beard shape-up.", DurationMinutes = 60, Price = 38m, DepositAmount = 8m },

        new() { Id = "demo-svc-2a", BusinessId = "demo-biz-2", Name = "Cut & Blow Dry", Description = "Consultation, cut and blow-dry finish.", DurationMinutes = 60, Price = 55m, DepositAmount = 14m },
        new() { Id = "demo-svc-2b", BusinessId = "demo-biz-2", Name = "Balayage", Description = "Hand-painted lightening, natural grow-out.", DurationMinutes = 180, Price = 150m, DepositAmount = 38m },

        new() { Id = "demo-svc-3a", BusinessId = "demo-biz-3", Name = "Gel Manicure", Description = "Shape, cuticle work and gel colour.", DurationMinutes = 45, Price = 32m, DepositAmount = 6m },
        new() { Id = "demo-svc-3b", BusinessId = "demo-biz-3", Name = "BIAB Overlay", Description = "Strengthening overlay on natural nails.", DurationMinutes = 60, Price = 42m, DepositAmount = 8m },

        new() { Id = "demo-svc-4a", BusinessId = "demo-biz-4", Name = "1-to-1 PT Session", Description = "60 minutes of coached strength training.", DurationMinutes = 60, Price = 60m, DepositAmount = 18m },
        new() { Id = "demo-svc-4b", BusinessId = "demo-biz-4", Name = "Assessment & Plan", Description = "Movement screen + 4-week programme.", DurationMinutes = 90, Price = 80m, DepositAmount = 24m },

        new() { Id = "demo-svc-5a", BusinessId = "demo-biz-5", Name = "Deep Tissue 60", Description = "Firm-pressure work on tension and knots.", DurationMinutes = 60, Price = 65m, DepositAmount = 13m },
        new() { Id = "demo-svc-5b", BusinessId = "demo-biz-5", Name = "Relax Swedish 90", Description = "Full-body flowing massage.", DurationMinutes = 90, Price = 85m, DepositAmount = 17m },
    };

    private static List<Staff> BuildDemoStaff() => new()
    {
        new() { Id = "demo-stf-1a", BusinessId = "demo-biz-1", Name = "Marcus Bell", Role = "Master Barber", Bio = "15 years on the chair. Fade specialist." },
        new() { Id = "demo-stf-1b", BusinessId = "demo-biz-1", Name = "Deniz Kaya", Role = "Senior Barber", Bio = "Scissor work and classic cuts." },
        new() { Id = "demo-stf-2a", BusinessId = "demo-biz-2", Name = "Sofia Ricci", Role = "Colour Director", Bio = "Balayage and blonde specialist." },
        new() { Id = "demo-stf-3a", BusinessId = "demo-biz-3", Name = "Mia Chen", Role = "Lead Nail Tech", Bio = "Nail art and structured gel." },
        new() { Id = "demo-stf-4a", BusinessId = "demo-biz-4", Name = "Tom Fraser", Role = "Head Coach", Bio = "S&C coach, ex-rugby." },
        new() { Id = "demo-stf-5a", BusinessId = "demo-biz-5", Name = "Elena Novak", Role = "Massage Therapist", Bio = "Deep tissue and sports therapy." },
    };

    private static List<Post> BuildDemoPosts()
    {
        // Reuse the SAME Business instances already in `Businesses` (not fresh copies),
        // so a later change to a business (e.g. IsApproved) is reflected on its posts too.
        var businesses = Businesses.ToDictionary(b => b.Id);
        (string bizId, string caption, double hoursAgo, string seed)[] rows =
        {
            ("demo-biz-1", "Fresh fades all week — walk-ins welcome, but book ahead for Saturday 💈", 2, "fade1"),
            ("demo-biz-1", "Hot towel shave Sunday special — £5 off before midday.", 20, "fade2"),
            ("demo-biz-2", "Balayage transformation from this afternoon ✨", 5, "hair1"),
            ("demo-biz-2", "New colour range just landed — ask about it at your next visit.", 30, "hair2"),
            ("demo-biz-3", "Chrome nails are back in for autumn 💅", 8, "nails1"),
            ("demo-biz-3", "BIAB restock — book your overlay this week.", 45, "nails2"),
            ("demo-biz-4", "Small group session this morning — three spots left for Thursday.", 3, "pt1"),
            ("demo-biz-4", "New 4-week strength programme now bookable.", 26, "pt2"),
            ("demo-biz-5", "Sunday reset — deep tissue slots open all afternoon.", 10, "massage1"),
            ("demo-biz-5", "New aromatherapy add-on available this month.", 50, "massage2"),
        };

        return rows.Select((r, i) => new Post
        {
            Id = $"demo-post-{i + 1}",
            BusinessId = r.bizId,
            Business = businesses[r.bizId],
            Caption = r.caption,
            ImageUrl = $"https://picsum.photos/seed/{r.seed}/900/700",
            CreatedAt = DateTime.Now.AddHours(-r.hoursAgo)
        }).ToList();
    }

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

public class MockPostService : IPostService
{
    public Task<List<Post>> GetFeedAsync()
    {
        var feed = MockStore.Posts
            .Where(p => p.Business?.IsApproved == true)
            .OrderByDescending(p => p.CreatedAt)
            .ToList();
        return Task.FromResult(feed);
    }

    public Task<List<Post>> GetPostsForBusinessAsync(string businessId)
        => Task.FromResult(MockStore.Posts.Where(p => p.BusinessId == businessId)
                                          .OrderByDescending(p => p.CreatedAt).ToList());

    public Task<Post?> CreatePostAsync(Post post)
    {
        post.Id = Guid.NewGuid().ToString();
        post.CreatedAt = DateTime.Now;
        post.Business ??= MockStore.Businesses.FirstOrDefault(b => b.Id == post.BusinessId);
        MockStore.Posts.Insert(0, post);
        return Task.FromResult<Post?>(post);
    }

    public Task DeletePostAsync(string postId)
    {
        MockStore.Posts.RemoveAll(p => p.Id == postId);
        return Task.CompletedTask;
    }
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
