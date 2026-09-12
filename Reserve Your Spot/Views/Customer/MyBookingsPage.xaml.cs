using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Services;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class MyBookingsPage : ContentPage
{
    private readonly MyBookingsViewModel _vm;
    private readonly IAuthService _authService;

    public MyBookingsPage(MyBookingsViewModel vm, IAuthService authService)
    {
        InitializeComponent();
        _vm = vm;
        _authService = authService;
        BindingContext = vm;
        vm.PropertyChanged += OnVmPropertyChanged;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (!_authService.IsLoggedIn)
        {
            await Shell.Current.GoToAsync(AppConstants.RouteLogin);
            return;
        }
        _vm.LoadBookingsCommand.Execute(null);
    }

    private void OnVmPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        if (e.PropertyName != nameof(_vm.SelectedTab)) return;
        var tab = _vm.SelectedTab;

        UpcomingPanel.IsVisible = tab == "Upcoming";
        PastPanel.IsVisible     = tab == "Past";
        CancelledPanel.IsVisible = tab == "Cancelled";

        TabUpcoming.BackgroundColor = tab == "Upcoming" ? Color.FromArgb("#C9A84C") : Color.FromArgb("#1E1E1E");
        TabPast.BackgroundColor     = tab == "Past"     ? Color.FromArgb("#C9A84C") : Color.FromArgb("#1E1E1E");
        TabCancelled.BackgroundColor = tab == "Cancelled" ? Color.FromArgb("#C9A84C") : Color.FromArgb("#1E1E1E");
    }
}
