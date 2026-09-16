using Microsoft.Extensions.Logging;
using Reserve_Your_Spot.Services;
using Reserve_Your_Spot.ViewModels;
using Reserve_Your_Spot.ViewModels.BusinessPortal;
using Reserve_Your_Spot.Views.Auth;
using Reserve_Your_Spot.Views.BusinessPortal;
using Reserve_Your_Spot.Views.Customer;
using Reserve_Your_Spot.Views.Onboarding;

namespace Reserve_Your_Spot
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                });

            RegisterServices(builder.Services);
            RegisterViewModels(builder.Services);
            RegisterPages(builder.Services);

#if DEBUG
            builder.Logging.AddDebug();
#endif

            return builder.Build();
        }

        private static void RegisterServices(IServiceCollection services)
        {
            services.AddSingleton<SupabaseService>();

            // Mock implementations so the app runs without a backend.
            // Swap these for AuthService / BusinessService / BookingService / PaymentService
            // once Supabase + Stripe are configured in AppConstants.
            services.AddSingleton<IAuthService, MockAuthService>();
            services.AddSingleton<IBusinessService, MockBusinessService>();
            services.AddSingleton<IBookingService, MockBookingService>();
            services.AddSingleton<IPaymentService, MockPaymentService>();
            services.AddSingleton<IReferralService, MockReferralService>();
            services.AddSingleton<IPostService, MockPostService>();
        }

        private static void RegisterViewModels(IServiceCollection services)
        {
            services.AddTransient<OnboardingViewModel>();
            services.AddTransient<LoginViewModel>();
            services.AddTransient<RegisterViewModel>();

            services.AddTransient<HomeViewModel>();
            services.AddTransient<SearchViewModel>();
            services.AddTransient<BusinessProfileViewModel>();
            services.AddTransient<ServiceSelectionViewModel>();
            services.AddTransient<StaffSelectionViewModel>();
            services.AddTransient<DateTimeSelectionViewModel>();
            services.AddTransient<PaymentViewModel>();
            services.AddTransient<BookingConfirmationViewModel>();
            services.AddTransient<MyBookingsViewModel>();
            services.AddTransient<FavouritesViewModel>();
            services.AddTransient<CustomerProfileViewModel>();

            services.AddTransient<DashboardViewModel>();
            services.AddTransient<CalendarViewModel>();
            services.AddTransient<AnalyticsViewModel>();
            services.AddTransient<ManageServicesViewModel>();
            services.AddTransient<ManageStaffViewModel>();
            services.AddTransient<BusinessProfileEditViewModel>();
            services.AddTransient<CreatePostViewModel>();
            services.AddTransient<BlockTimeViewModel>();
        }

        private static void RegisterPages(IServiceCollection services)
        {
            services.AddTransient<OnboardingPage>();
            services.AddTransient<LoginPage>();
            services.AddTransient<RegisterPage>();
            services.AddTransient<BusinessRegisterPage>();

            services.AddTransient<HomePage>();
            services.AddTransient<SearchPage>();
            services.AddTransient<BusinessProfilePage>();
            services.AddTransient<ServiceSelectionPage>();
            services.AddTransient<StaffSelectionPage>();
            services.AddTransient<DateTimeSelectionPage>();
            services.AddTransient<PaymentPage>();
            services.AddTransient<BookingConfirmationPage>();
            services.AddTransient<MyBookingsPage>();
            services.AddTransient<FavouritesPage>();
            services.AddTransient<CustomerProfilePage>();

            services.AddTransient<DashboardPage>();
            services.AddTransient<CalendarPage>();
            services.AddTransient<CreatePostPage>();
            services.AddTransient<BlockTimePage>();
        }
    }
}
