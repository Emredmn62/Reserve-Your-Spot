using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;

namespace Reserve_Your_Spot.ViewModels;

public class OnboardingSlide
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconEmoji { get; set; } = string.Empty;
    public string BackgroundColor { get; set; } = "#0A0A0A";
}

public partial class OnboardingViewModel : BaseViewModel
{
    [ObservableProperty] private int _currentIndex;
    [ObservableProperty] private OnboardingSlide _currentSlide;

    public List<OnboardingSlide> Slides { get; } = new()
    {
        new() { Title = "Discover Local Pros", Description = "Find the best barbers, salons, PTs, and more in your area — all in one place.", IconEmoji = "🗺️", BackgroundColor = "#0A0A0A" },
        new() { Title = "Book in Seconds",      Description = "Choose your service, pick a time, and you're booked. No phone calls needed.",  IconEmoji = "⚡", BackgroundColor = "#0D0D0D" },
        new() { Title = "Secure & Simple",      Description = "Pay a small deposit to confirm. The rest you pay in person. Cancel anytime.",    IconEmoji = "🔒", BackgroundColor = "#0A0A0A" },
    };

    public OnboardingViewModel()
    {
        _currentSlide = Slides[0];
    }

    [RelayCommand]
    private void Skip() => NavigateToLogin();

    // "Get Started" drops you straight into the app as a guest — browsing is
    // open to everyone. Signing in only happens when you try to do something
    // that needs an account (book, save a favourite, etc).
    [RelayCommand]
    private void GetStarted()
    {
        Shell.Current.GoToAsync(AppConstants.RouteHome);
    }

    private static void NavigateToLogin()
    {
        Shell.Current.GoToAsync(AppConstants.RouteLogin);
    }
}
