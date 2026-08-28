using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

public class DayRevenue
{
    public string Label { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int Bookings { get; set; }
    public double BarHeight { get; set; } // 0-1, relative
}

public partial class AnalyticsViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private string? _businessId;

    [ObservableProperty] private string _selectedPeriod = "This Month";
    [ObservableProperty] private int _totalBookings;
    [ObservableProperty] private decimal _totalRevenue;
    [ObservableProperty] private int _newCustomers;
    [ObservableProperty] private int _noShows;
    [ObservableProperty] private double _averageRating;

    public ObservableCollection<DayRevenue> MonthlyData { get; } = new();
    public List<string> Periods { get; } = new() { "This Week", "This Month", "All Time" };

    public AnalyticsViewModel(IBookingService bookingService, IBusinessService businessService, IAuthService authService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        _authService = authService;
        Title = "Analytics";
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
            AverageRating = biz?.Rating ?? 0;
            await RefreshAsync();
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SelectPeriodAsync(string period)
    {
        SelectedPeriod = period;
        await RefreshAsync();
    }

    private async Task RefreshAsync()
    {
        if (_businessId == null) return;
        var bookings = await _bookingService.GetBusinessBookingsAsync(_businessId);
        var now = DateTime.Now;
        IEnumerable<Booking> filtered = SelectedPeriod switch
        {
            "This Week"  => bookings.Where(b => b.StartTime >= now.AddDays(-7)),
            "This Month" => bookings.Where(b => b.StartTime.Month == now.Month && b.StartTime.Year == now.Year),
            _            => bookings
        };
        var list = filtered.ToList();

        TotalBookings = list.Count;
        TotalRevenue = list.Where(b => b.DepositPaid).Sum(b => b.DepositAmount);
        NoShows = list.Count(b => b.Status == BookingStatus.NoShow);
        NewCustomers = list.Select(b => b.CustomerId).Distinct().Count();

        // Build bar chart data (by day for month, by week for all time)
        var grouped = list
            .GroupBy(b => b.StartTime.Date)
            .OrderBy(g => g.Key)
            .Select(g => new DayRevenue
            {
                Label = g.Key.ToString("dd"),
                Revenue = g.Sum(b => b.DepositAmount),
                Bookings = g.Count()
            }).ToList();

        var maxRev = grouped.Any() ? grouped.Max(d => d.Revenue) : 1;
        foreach (var d in grouped)
            d.BarHeight = maxRev > 0 ? (double)(d.Revenue / maxRev) : 0;

        MonthlyData.Clear();
        foreach (var d in grouped) MonthlyData.Add(d);
    }
}
