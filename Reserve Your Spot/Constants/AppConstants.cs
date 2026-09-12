namespace Reserve_Your_Spot.Constants;

public static class AppConstants
{
    public const string AppName = "Reserve Your Spot";
    public const string SupabaseUrl = "YOUR_SUPABASE_URL";
    public const string SupabaseAnonKey = "YOUR_SUPABASE_ANON_KEY";
    public const string StripePublishableKey = "YOUR_STRIPE_PUBLISHABLE_KEY";
    public const string GoogleMapsKey = "YOUR_GOOGLE_MAPS_KEY";
    // ---- Monetisation ----
    // Single plan. No cut of bookings — the subscription is the whole business model.
    public const decimal SubscriptionMonthlyPrice = 10.00m;   // £/month
    public const int FreeTrialMonths = 3;                     // first N months free
    public const decimal DepositPlatformFeePercent = 0.00m;   // we do NOT skim deposits
    public const string SubscriptionCurrency = "gbp";

    // Set to your Stripe Billing Price ID (price_...) once Stripe is configured.
    public const string StripeSubscriptionPriceId = "YOUR_STRIPE_PRICE_ID";

    // Kept for backwards-compat with existing code paths.
    public const decimal PlatformFeePercent = DepositPlatformFeePercent;
    public const decimal ProMonthlyPrice = SubscriptionMonthlyPrice;

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
}
