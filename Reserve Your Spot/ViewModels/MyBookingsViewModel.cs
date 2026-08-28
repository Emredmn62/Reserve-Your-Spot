using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

public partial class MyBookingsViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;

    [ObservableProperty] private string _selectedTab = "Upcoming";

    public ObservableCollection<Booking> UpcomingBookings { get; } = new();
    public ObservableCollection<Booking> PastBookings { get; } = new();
    public ObservableCollection<Booking> CancelledBookings { get; } = new();

    public MyBookingsViewModel(IBookingService bookingService, IBusinessService businessService, IAuthService authService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        _authService = authService;
        Title = "My Bookings";
    }

    [RelayCommand]
    private async Task LoadBookingsAsync()
    {
        var uid = _authService.CurrentUserId;
        if (string.IsNullOrEmpty(uid)) return;
        IsBusy = true;
        try
        {
            var all = await _bookingService.GetCustomerBookingsAsync(uid);
            var now = DateTime.Now;

            UpcomingBookings.Clear();
            PastBookings.Clear();
            CancelledBookings.Clear();

            foreach (var b in all)
            {
                if (b.BusinessId != null)
                    b.Business = await _businessService.GetBusinessByIdAsync(b.BusinessId);

                if (b.Status == BookingStatus.Cancelled)
                    CancelledBookings.Add(b);
                else if (b.StartTime > now || b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending)
                    UpcomingBookings.Add(b);
                else
                    PastBookings.Add(b);
            }
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task CancelBookingAsync(Booking booking)
    {
        var confirm = await Shell.Current.DisplayAlert(
            "Cancel Booking", "Are you sure you want to cancel?", "Yes, Cancel", "Keep");
        if (!confirm) return;
        var success = await _bookingService.CancelBookingAsync(booking.Id, "Customer cancelled");
        if (success) await LoadBookingsAsync();
    }

    [RelayCommand]
    private async Task RebookAsync(Booking booking)
    {
        if (booking.BusinessId != null)
            await Shell.Current.GoToAsync($"serviceselection?businessId={booking.BusinessId}");
    }

    [RelayCommand]
    private void SelectTab(string tab) => SelectedTab = tab;
}
