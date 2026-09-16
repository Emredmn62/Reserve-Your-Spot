namespace Reserve_Your_Spot.Constants;

public static class AppConstants
{
    public const string AppName = "Reserve Your Spot";
    public const string SupabaseUrl = "YOUR_SUPABASE_URL";
    public const string SupabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
    public const string StripePublishableKey = "YOUR_STRIPE_PUBLISHABLE_KEY";
    public const string GoogleMapsKey = "YOUR_GOOGLE_MAPS_KEY";
    // ---- Monetisation ----
    // A business pays a small yearly listing fee, then 5% of every booking they
    // take through the app. Money goes straight to the business via Stripe
    // Connect; the 5% is skimmed automatically as a Stripe application fee.
    // Change this one number if you want a different yearly price.
    public const decimal SubscriptionYearlyPrice = 20.00m;    // £/year
    public const decimal BookingPlatformFeePercent = 0.05m;   // your 5% cut of every booking
    public const string SubscriptionCurrency = "gbp";

    // Stripe dashboard -> Product catalog -> create a recurring YEARLY price
    // for "Reserve Your Spot listing" -> paste its id (price_...) here.
    public const string StripeSubscriptionYearlyPriceId = "YOUR_STRIPE_YEARLY_PRICE_ID";

    // Kept for backwards-compat with any older references.
    public const decimal PlatformFeePercent = BookingPlatformFeePercent;

    // Route names
    public const string RouteOnboarding = "onboarding";
    public const string RouteLogin = "login";
    public const string RouteRegister = "register";
    public const string RouteBusinessRegister = "businessregister";
    public const string RouteHome = "//home";
    public const string RouteSearch = "//search";
    public const string RouteMyBookings = "//mybookings";
    public const string RouteFavourites = "//favourites";
    public const string RouteProfile = "//profile";
    public const string RouteBusinessDashboard = "//dashboard";
    public const string RouteBusinessProfile = "businessprofile";
    public const string RouteServiceSelection = "serviceselection";
    public const string RouteStaffSelection = "staffselection";
    public const string RouteDateTimeSelection = "datetimeselection";
    public const string RoutePayment = "payment";
    public const string RouteBookingConfirmation = "bookingconfirmation";
    public const string RouteCreatePost = "createpost";
    public const string RouteBlockTime = "blocktime";
}
