using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

public partial class DashboardViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;

    [ObservableProperty] private string _businessName = string.Empty;
    [ObservableProperty] private string _todayDate = DateTime.Today.ToString("dddd, d MMMM");
    [ObservableProperty] private decimal _todayRevenue;
    [ObservableProperty] private int _todayBookingCount;
    [ObservableProperty] private decimal _outstandingBalance;
    [ObservableProperty] private Models.Business? _business;

    public ObservableCollection<Booking> TodaysBookings { get; } = new();

    public DashboardViewModel(IBookingService bookingService, IBusinessService businessService, IAuthService authService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        _authService = authService;
        Title = "Dashboard";
    }

    [RelayCommand]
    private async Task LoadDataAsync()
    {
        IsBusy = true;
        ClearError();
        try
        {
            var uid = _authService.CurrentUserId;
            if (uid == null) return;
            Business = await _businessService.GetBusinessByOwnerAsync(uid);
            if (Business == null) return;
            BusinessName = Business.Name;

            var bookings = await _bookingService.GetBusinessBookingsAsync(Business.Id, DateTime.Today);
            TodaysBookings.Clear();
            decimal revenue = 0, outstanding = 0;
            foreach (var b in bookings)
            {
                TodaysBookings.Add(b);
                if (b.DepositPaid) revenue += b.DepositAmount;
                outstanding += b.RemainingBalance;
            }
            TodayBookingCount = bookings.Count;
            TodayRevenue = revenue;
            OutstandingBalance = outstanding;
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task CreateManualBookingAsync()
        => await Shell.Current.DisplayAlert("Manual Booking", "Manual booking UI coming soon.", "OK");

    [RelayCommand]
    private async Task BlockTimeAsync()
        => await Shell.Current.DisplayAlert("Block Time", "Block time UI coming soon.", "OK");

    [RelayCommand]
    private async Task ConfirmBookingAsync(Booking booking)
    {
        await _bookingService.ConfirmBookingAsync(booking.Id);
        await LoadDataAsync();
    }

    [RelayCommand]
    private async Task MarkNoShowAsync(Booking booking)
    {
        await _bookingService.MarkNoShowAsync(booking.Id);
        await LoadDataAsync();
    }
}
