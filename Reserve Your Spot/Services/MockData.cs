using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

/// <summary>
/// In-memory seed data + mock service implementations so the app runs end-to-end
/// without a Supabase / Stripe backend. Swap these registrations in MauiProgram for
/// the real services once the backend is configured.
/// </summary>
public static class MockStore
{
    public const string DemoUserId = "demo-user";
    public const string DemoOwnerBusinessId = "biz-1";

    public static readonly User DemoUser = new()
    {
        Id = DemoUserId,
        Email = "alex@example.com",
        FullName = "Alex Morgan",
        PhoneNumber = "+44 7700 900123",
        IsBusinessOwner = false,
        CreatedAt = DateTime.Now.AddMonths(-8)
    };

    private static Category Cat(string slug) =>
        Category.Defaults.First(c => c.Slug == slug);

    private static Dictionary<string, string> Hours(string open = "09:00", string close = "18:00") => new()
    {
        ["monday"] = $"{open}-{close}",
        ["tuesday"] = $"{open}-{close}",
        ["wednesday"] = $"{open}-{close}",
        ["thursday"] = $"{open}-{close}",
        ["friday"] = $"{open}-{close}",
        ["saturday"] = $"{open}-16:00",
        ["sunday"] = "closed-closed"
    };

    public static readonly List<Business> Businesses = new()
    {
        new Business
        {
            Id = "biz-1", OwnerId = DemoUserId, Name = "Fade Masters Barbershop", Slug = "fade-masters",
            Description = "Precision fades, hot-towel shaves and beard sculpting in the heart of Shoreditch. Walk-ins welcome, but booking guarantees your chair.",
            CategoryId = "1", Category = Cat("barbers"),
            Address = "42 Rivington Street, Shoreditch, London EC2A 3AY",
            Latitude = 51.5265, Longitude = -0.0805, Phone = "+44 20 7946 0111", WhatsAppNumber = "447700900111",
            Rating = 4.8, TotalReviews = 214, IsApproved = true, IsFeatured = true,
            OpeningHours = Hours("09:00", "19:00"), DepositPercentage = 20,
            CancellationPolicy = "Free cancellation up to 24h before. Deposit is non-refundable within 24h."
        },
        new Business
        {
            Id = "biz-2", OwnerId = "owner-2", Name = "The Gilded Chair", Slug = "the-gilded-chair",
            Description = "A boutique salon for cut, colour and treatments. Our stylists train in Mayfair and bring that polish to Soho.",
            CategoryId = "2", Category = Cat("hair"),
            Address = "9 Berwick Street, Soho, London W1F 0PP",
            Latitude = 51.5138, Longitude = -0.1360, Phone = "+44 20 7946 0122",
            Rating = 4.7, TotalReviews = 168, IsApproved = true, IsFeatured = true,
            OpeningHours = Hours("10:00", "20:00"), DepositPercentage = 25,
            CancellationPolicy = "48h notice required for a full refund of your deposit."
        },
        new Business
        {
            Id = "biz-3", OwnerId = "owner-3", Name = "Lux Nail Lounge", Slug = "lux-nail-lounge",
            Description = "Gel, BIAB and nail art by award-winning techs. Relax with a complimentary drink while we work.",
            CategoryId = "3", Category = Cat("nails"),
            Address = "17 Upper Street, Islington, London N1 0PQ",
            Latitude = 51.5340, Longitude = -0.1030, Phone = "+44 20 7946 0133",
            Rating = 4.6, TotalReviews = 97, IsApproved = true, IsFeatured = false,
            OpeningHours = Hours("09:30", "18:30"), DepositPercentage = 20,
            CancellationPolicy = "Please give 24h notice to reschedule."
        },
        new Business
        {
            Id = "biz-4", OwnerId = "owner-4", Name = "Iron & Oak PT Studio", Slug = "iron-and-oak",
            Description = "Private personal training studio. 1-to-1 and small-group strength coaching with a plan tailored to you.",
            CategoryId = "6", Category = Cat("pt"),
            Address = "3 Morning Lane, Hackney, London E9 6ND",
            Latitude = 51.5460, Longitude = -0.0540, Phone = "+44 20 7946 0144",
            Rating = 4.9, TotalReviews = 76, IsApproved = true, IsFeatured = true,
            OpeningHours = Hours("06:00", "21:00"), DepositPercentage = 30,
            CancellationPolicy = "24h cancellation policy. Late cancellations forfeit the session."
        },
        new Business
        {
            Id = "biz-5", OwnerId = "owner-5", Name = "Serenity Massage Rooms", Slug = "serenity-massage",
            Description = "Deep tissue, sports and Swedish massage in a calm studio near Camden Lock.",
            CategoryId = "8", Category = Cat("massage"),
            Address = "88 Chalk Farm Road, Camden, London NW1 8AR",
            Latitude = 51.5430, Longitude = -0.1490, Phone = "+44 20 7946 0155",
            Rating = 4.5, TotalReviews = 52, IsApproved = true, IsFeatured = false,
            OpeningHours = Hours("10:00", "20:00"), DepositPercentage = 20,
            CancellationPolicy = "Deposits transfer once to a later date with 24h notice."
        },
        new Business
        {
            Id = "biz-6", OwnerId = "owner-6", Name = "Sharp & Co Grooming", Slug = "sharp-and-co",
            Description = "Classic barbering with a modern edge. Skin fades, scissor cuts and traditional wet shaves.",
            CategoryId = "1", Category = Cat("barbers"),
            Address = "120 Kingsland High Street, Dalston, London E8 2NS",
            Latitude = 51.5480, Longitude = -0.0760, Phone = "+44 20 7946 0166",
            Rating = 4.4, TotalReviews = 130, IsApproved = true, IsFeatured = false,
            OpeningHours = Hours("09:00", "18:00"), DepositPercentage = 15,
            CancellationPolicy = "Cancel any time up to 12h before your appointment."
        }
    };

    public static readonly List<Service> Services = new()
    {
        // Fade Masters (biz-1)
        new() { Id = "svc-1a", BusinessId = "biz-1", Name = "Skin Fade", Description = "Bald or skin fade tailored to your head shape, finished with a line-up.", DurationMinutes = 45, Price = 28m, DepositAmount = 6m },
        new() { Id = "svc-1b", BusinessId = "biz-1", Name = "Cut & Beard Combo", Description = "Full haircut plus beard shape-up with hot towel.", DurationMinutes = 60, Price = 38m, DepositAmount = 8m },
        new() { Id = "svc-1c", BusinessId = "biz-1", Name = "Hot Towel Wet Shave", Description = "Traditional straight-razor shave with pre- and post-shave care.", DurationMinutes = 40, Price = 30m, DepositAmount = 6m },
        new() { Id = "svc-1d", BusinessId = "biz-1", Name = "Kids Cut (u12)", Description = "Quick, patient haircut for under-12s.", DurationMinutes = 30, Price = 18m, DepositAmount = 4m },

        // The Gilded Chair (biz-2)
        new() { Id = "svc-2a", BusinessId = "biz-2", Name = "Cut & Blow Dry", Description = "Consultation, cut and a professional blow-dry finish.", DurationMinutes = 60, Price = 55m, DepositAmount = 14m },
        new() { Id = "svc-2b", BusinessId = "biz-2", Name = "Full Head Colour", Description = "Single-process colour, toner and blow-dry.", DurationMinutes = 120, Price = 95m, DepositAmount = 24m },
        new() { Id = "svc-2c", BusinessId = "biz-2", Name = "Balayage", Description = "Hand-painted lightening for a lived-in, natural grow-out.", DurationMinutes = 180, Price = 150m, DepositAmount = 38m },

        // Lux Nail Lounge (biz-3)
        new() { Id = "svc-3a", BusinessId = "biz-3", Name = "Gel Manicure", Description = "Shape, cuticle work and gel colour that lasts 2+ weeks.", DurationMinutes = 45, Price = 32m, DepositAmount = 6m },
        new() { Id = "svc-3b", BusinessId = "biz-3", Name = "BIAB Overlay", Description = "Builder-in-a-bottle strengthening overlay on natural nails.", DurationMinutes = 60, Price = 42m, DepositAmount = 8m },
        new() { Id = "svc-3c", BusinessId = "biz-3", Name = "Luxury Pedicure", Description = "Soak, scrub, massage and polish.", DurationMinutes = 60, Price = 45m, DepositAmount = 9m },

        // Iron & Oak PT (biz-4)
        new() { Id = "svc-4a", BusinessId = "biz-4", Name = "1-to-1 PT Session", Description = "60 minutes of coached strength and conditioning.", DurationMinutes = 60, Price = 60m, DepositAmount = 18m },
        new() { Id = "svc-4b", BusinessId = "biz-4", Name = "Assessment & Plan", Description = "Movement screen, goal-setting and a 4-week programme.", DurationMinutes = 90, Price = 80m, DepositAmount = 24m },
        new() { Id = "svc-4c", BusinessId = "biz-4", Name = "Small Group (max 4)", Description = "Semi-private session with individual coaching cues.", DurationMinutes = 45, Price = 25m, DepositAmount = 8m },

        // Serenity Massage (biz-5)
        new() { Id = "svc-5a", BusinessId = "biz-5", Name = "Deep Tissue 60", Description = "Firm-pressure work on stubborn knots and tension.", DurationMinutes = 60, Price = 65m, DepositAmount = 13m },
        new() { Id = "svc-5b", BusinessId = "biz-5", Name = "Sports Massage 45", Description = "Targeted recovery work for active bodies.", DurationMinutes = 45, Price = 55m, DepositAmount = 11m },
        new() { Id = "svc-5c", BusinessId = "biz-5", Name = "Relax Swedish 90", Description = "Full-body flowing massage to unwind completely.", DurationMinutes = 90, Price = 85m, DepositAmount = 17m },

        // Sharp & Co (biz-6)
        new() { Id = "svc-6a", BusinessId = "biz-6", Name = "Classic Cut", Description = "Scissor or clipper cut, styled and finished.", DurationMinutes = 40, Price = 24m, DepositAmount = 4m },
        new() { Id = "svc-6b", BusinessId = "biz-6", Name = "Fade & Design", Description = "Sharp fade with an optional freehand design.", DurationMinutes = 50, Price = 30m, DepositAmount = 5m },
        new() { Id = "svc-6c", BusinessId = "biz-6", Name = "Beard Trim", Description = "Shape, tidy and condition.", DurationMinutes = 20, Price = 14m, DepositAmount = 3m }
    };

    public static readonly List<Staff> Staff = new()
    {
        new() { Id = "stf-1a", BusinessId = "biz-1", Name = "Marcus Bell", Role = "Master Barber", Bio = "15 years on the chair. Fade specialist and shop founder." },
        new() { Id = "stf-1b", BusinessId = "biz-1", Name = "Deniz Kaya", Role = "Senior Barber", Bio = "Scissor work and classic cuts." },
        new() { Id = "stf-1c", BusinessId = "biz-1", Name = "Reece Palmer", Role = "Barber", Bio = "Sharp line-ups and beard sculpting." },

        new() { Id = "stf-2a", BusinessId = "biz-2", Name = "Sofia Ricci", Role = "Colour Director", Bio = "Balayage and blonde specialist." },
        new() { Id = "stf-2b", BusinessId = "biz-2", Name = "Jonah Adeyemi", Role = "Senior Stylist", Bio = "Precision cutting and curly hair." },

        new() { Id = "stf-3a", BusinessId = "biz-3", Name = "Mia Chen", Role = "Lead Nail Tech", Bio = "Nail art and structured gel." },
        new() { Id = "stf-3b", BusinessId = "biz-3", Name = "Priya Nair", Role = "Nail Tech", Bio = "BIAB and natural nail care." },

        new() { Id = "stf-4a", BusinessId = "biz-4", Name = "Tom Fraser", Role = "Head Coach", Bio = "S&C coach, ex-rugby. Strength and rehab." },
        new() { Id = "stf-4b", BusinessId = "biz-4", Name = "Nadia Rahman", Role = "PT", Bio = "Mobility, conditioning and habit coaching." },

        new() { Id = "stf-5a", BusinessId = "biz-5", Name = "Elena Novak", Role = "Massage Therapist", Bio = "Deep tissue and sports therapy." },

        new() { Id = "stf-6a", BusinessId = "biz-6", Name = "Ade Okoro", Role = "Barber", Bio = "Fades and freehand designs." },
        new() { Id = "stf-6b", BusinessId = "biz-6", Name = "Liam Byrne", Role = "Barber", Bio = "Classic cuts and beard work." }
    };

    private static User Reviewer(string name) => new() { Id = Guid.NewGuid().ToString(), FullName = name };

    public static readonly List<Review> Reviews = new()
    {
        new() { Id = "rev-1", BusinessId = "biz-1", Rating = 5, Comment = "Best fade in London. Marcus takes his time and it always looks fresh for weeks.", CreatedAt = DateTime.Now.AddDays(-4), Customer = Reviewer("James O.") },
        new() { Id = "rev-2", BusinessId = "biz-1", Rating = 5, Comment = "Booking was easy and they were bang on time. Great shave.", CreatedAt = DateTime.Now.AddDays(-12), Customer = Reviewer("Sam T.") },
        new() { Id = "rev-3", BusinessId = "biz-1", Rating = 4, Comment = "Solid cut, shop gets busy on Saturdays so book ahead.", CreatedAt = DateTime.Now.AddDays(-20), Customer = Reviewer("Danny R.") },

        new() { Id = "rev-4", BusinessId = "biz-2", Rating = 5, Comment = "Sofia completely fixed a box-dye disaster. Colour looks incredible.", CreatedAt = DateTime.Now.AddDays(-6), Customer = Reviewer("Hannah M.") },
        new() { Id = "rev-5", BusinessId = "biz-2", Rating = 4, Comment = "Lovely salon and great cut, ran about 15 mins late.", CreatedAt = DateTime.Now.AddDays(-15), Customer = Reviewer("Priya K.") },

        new() { Id = "rev-6", BusinessId = "biz-3", Rating = 5, Comment = "My BIAB lasted three weeks with zero chips. Will be back.", CreatedAt = DateTime.Now.AddDays(-3), Customer = Reviewer("Chloe W.") },
        new() { Id = "rev-7", BusinessId = "biz-4", Rating = 5, Comment = "Tom actually listens. Strongest and most mobile I've felt in years.", CreatedAt = DateTime.Now.AddDays(-8), Customer = Reviewer("Michael B.") },
        new() { Id = "rev-8", BusinessId = "biz-5", Rating = 4, Comment = "Elena found every knot. Firm but exactly what I asked for.", CreatedAt = DateTime.Now.AddDays(-9), Customer = Reviewer("Laura F.") },
        new() { Id = "rev-9", BusinessId = "biz-6", Rating = 4, Comment = "Good value classic cut, friendly team.", CreatedAt = DateTime.Now.AddDays(-5), Customer = Reviewer("Owen H.") }
    };

    public static readonly HashSet<string> Favourites = new() { "biz-2", "biz-4" };

    public static readonly List<LoyaltyCard> LoyaltyCards = new()
    {
        new() { Id = "loy-1", CustomerId = DemoUserId, BusinessId = "biz-1", TotalStamps = 3, RequiredStamps = 6, RewardDescription = "6th cut free", Business = Businesses[0] },
        new() { Id = "loy-2", CustomerId = DemoUserId, BusinessId = "biz-3", TotalStamps = 4, RequiredStamps = 5, RewardDescription = "Free luxury pedicure", Business = Businesses[2] }
    };

    public static readonly List<Booking> Bookings = BuildBookings();

    private static List<Booking> BuildBookings()
    {
        var list = new List<Booking>();
        var today = DateTime.Today;

        Booking Make(string id, string bizId, string svcId, string? staffId, DateTime start, BookingStatus status, string customerId, string customerName)
        {
            var biz = Businesses.First(b => b.Id == bizId);
            var svc = Services.First(s => s.Id == svcId);
            var staff = staffId != null ? Staff.FirstOrDefault(s => s.Id == staffId) : null;
            return new Booking
            {
                Id = id, CustomerId = customerId, BusinessId = bizId, ServiceId = svcId, StaffId = staffId,
                StartTime = start, EndTime = start.AddMinutes(svc.DurationMinutes),
                Status = status, TotalPrice = svc.Price, DepositAmount = svc.DepositAmount,
                DepositPaid = true, RemainingBalance = svc.Price - svc.DepositAmount,
                CreatedAt = start.AddDays(-2),
                Business = biz, Service = svc, Staff = staff,
                Customer = new User { Id = customerId, FullName = customerName }
            };
        }

        // Demo customer's own bookings
        list.Add(Make("bkg-c1", "biz-2", "svc-2a", "stf-2b", today.AddDays(3).AddHours(11), BookingStatus.Confirmed, DemoUserId, DemoUser.FullName));
        list.Add(Make("bkg-c2", "biz-4", "svc-4a", "stf-4a", today.AddDays(6).AddHours(18), BookingStatus.Pending, DemoUserId, DemoUser.FullName));
        list.Add(Make("bkg-c3", "biz-1", "svc-1b", "stf-1a", today.AddDays(-14).AddHours(15), BookingStatus.Completed, DemoUserId, DemoUser.FullName));
        list.Add(Make("bkg-c4", "biz-3", "svc-3b", "stf-3a", today.AddDays(-30).AddHours(13), BookingStatus.Cancelled, DemoUserId, DemoUser.FullName));

        // Bookings at the demo owner's shop (biz-1) for the dashboard / calendar
        list.Add(Make("bkg-o1", "biz-1", "svc-1a", "stf-1a", today.AddHours(10), BookingStatus.Confirmed, "cust-a", "George Hill"));
        list.Add(Make("bkg-o2", "biz-1", "svc-1b", "stf-1b", today.AddHours(12).AddMinutes(30), BookingStatus.Confirmed, "cust-b", "Tobi Ade"));
        list.Add(Make("bkg-o3", "biz-1", "svc-1c", "stf-1a", today.AddHours(14), BookingStatus.Pending, "cust-c", "Ryan Cole"));
        list.Add(Make("bkg-o4", "biz-1", "svc-1a", "stf-1c", today.AddHours(16).AddMinutes(30), BookingStatus.Confirmed, "cust-d", "Marco Silva"));
        list.Add(Make("bkg-o5", "biz-1", "svc-1b", "stf-1b", today.AddDays(1).AddHours(11), BookingStatus.Confirmed, "cust-e", "Femi Balogun"));
        list.Add(Make("bkg-o6", "biz-1", "svc-1d", "stf-1c", today.AddDays(2).AddHours(10), BookingStatus.Confirmed, "cust-f", "Aaron Webb"));

        return list;
    }

    public static readonly List<Payment> Payments = new();
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
        // Any credentials work in the demo. Use a "biz@" prefix to sign in as a business owner.
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
    public Task<List<Business>> GetNearbyBusinessesAsync(double lat, double lng, double radiusKm = 10)
    {
        var i = 0.3;
        foreach (var b in MockStore.Businesses) { b.DistanceKm = Math.Round(i, 1); i += 0.45; }
        return Task.FromResult(MockStore.Businesses.OrderBy(b => b.DistanceKm).ToList());
    }

    public Task<List<Business>> GetFeaturedBusinessesAsync()
        => Task.FromResult(MockStore.Businesses.Where(b => b.IsFeatured).ToList());

    public Task<List<Business>> SearchBusinessesAsync(string query, string? categorySlug = null)
    {
        IEnumerable<Business> q = MockStore.Businesses;
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

    public Task<Business?> GetBusinessByOwnerAsync(string ownerId)
        => Task.FromResult(MockStore.Businesses.FirstOrDefault(b => b.OwnerId == ownerId)
                           ?? MockStore.Businesses.FirstOrDefault(b => b.Id == MockStore.DemoOwnerBusinessId));

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
        business.IsApproved = true;
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
        var seed = (date.DayOfYear + businessId.GetHashCode()) & 0x7fffffff;

        var cursor = start;
        var idx = 0;
        while (cursor.AddMinutes(durationMinutes) <= end)
        {
            var isPast = cursor <= now;
            // Deterministic pseudo-availability so the grid looks realistic.
            var taken = ((seed / (idx + 1)) + idx) % 3 == 0;
            slots.Add(new TimeSlot
            {
                DateTime = cursor,
                IsAvailable = !isPast && !taken,
                StaffId = staffId,
                IsLastMinute = !isPast && (cursor - now).TotalHours <= 3 && !taken
            });
            cursor = cursor.AddMinutes(30);
            idx++;
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
