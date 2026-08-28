using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

public partial class CalendarViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private string? _businessId;

    [ObservableProperty] private bool _isWeekView = true;
    [ObservableProperty] private DateTime _currentWeekStart;
    [ObservableProperty] private string _periodLabel = string.Empty;

    public ObservableCollection<Booking> DisplayedBookings { get; } = new();

    public CalendarViewModel(IBookingService bookingService, IBusinessService businessService, IAuthService authService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        _authService = authService;
        Title = "Calendar";
        var today = DateTime.Today;
        _currentWeekStart = today.AddDays(-(int)today.DayOfWeek + (int)DayOfWeek.Monday);
        UpdatePeriodLabel();
    }

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var uid = _authService.CurrentUserId;
            if (uid == null) return;
            var biz = await _businessService.GetBusinessByOwnerAsync(uid);
            _businessId = biz?.Id;
            await RefreshBookingsAsync();
        }
        finally { IsBusy = false; }
    }

    private async Task RefreshBookingsAsync()
    {
        if (_businessId == null) return;
        DisplayedBookings.Clear();
        var end = IsWeekView ? CurrentWeekStart.AddDays(7) : CurrentWeekStart.AddDays(30);
        var bookings = await _bookingService.GetBusinessBookingsAsync(_businessId);
        foreach (var b in bookings.Where(b => b.StartTime >= CurrentWeekStart && b.StartTime < end))
            DisplayedBookings.Add(b);
    }

    [RelayCommand]
    private async Task PreviousAsync()
    {
        CurrentWeekStart = IsWeekView ? CurrentWeekStart.AddDays(-7) : CurrentWeekStart.AddMonths(-1);
        UpdatePeriodLabel();
        await RefreshBookingsAsync();
    }

    [RelayCommand]
    private async Task NextAsync()
    {
        CurrentWeekStart = IsWeekView ? CurrentWeekStart.AddDays(7) : CurrentWeekStart.AddMonths(1);
        UpdatePeriodLabel();
        await RefreshBookingsAsync();
    }

    [RelayCommand]
    private async Task ToggleViewAsync()
    {
        IsWeekView = !IsWeekView;
        UpdatePeriodLabel();
        await RefreshBookingsAsync();
    }

    private void UpdatePeriodLabel()
    {
        PeriodLabel = IsWeekView
            ? $"{CurrentWeekStart:d MMM} – {CurrentWeekStart.AddDays(6):d MMM yyyy}"
            : CurrentWeekStart.ToString("MMMM yyyy");
    }
}
