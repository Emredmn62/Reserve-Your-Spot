using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

[QueryProperty(nameof(BusinessId), "businessId")]
[QueryProperty(nameof(ServiceId), "serviceId")]
[QueryProperty(nameof(StaffId), "staffId")]
public partial class DateTimeSelectionViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;

    [ObservableProperty] private string? _businessId;
    [ObservableProperty] private string? _serviceId;
    [ObservableProperty] private string? _staffId;
    [ObservableProperty] private Service? _service;
    [ObservableProperty] private DateTime _selectedDate = DateTime.Today;
    [ObservableProperty] private TimeSlot? _selectedTimeSlot;
    [ObservableProperty] private DateTime _displayMonth;
    [ObservableProperty] private bool _canContinue;

    public ObservableCollection<CalendarDay> CalendarDays { get; } = new();
    public ObservableCollection<TimeSlot> TimeSlots { get; } = new();

    public DateTimeSelectionViewModel(IBookingService bookingService, IBusinessService businessService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        Title = "Pick a Date & Time";
        _displayMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        BuildCalendar();
    }

    partial void OnBusinessIdChanged(string? v) { if (v != null && ServiceId != null) _ = LoadServiceAsync(); }
    partial void OnServiceIdChanged(string? v)  { if (v != null && BusinessId != null) _ = LoadServiceAsync(); }
    partial void OnSelectedTimeSlotChanged(TimeSlot? v) => CanContinue = v != null;

    private async Task LoadServiceAsync()
    {
        var services = await _businessService.GetServicesAsync(BusinessId!);
        Service = services.FirstOrDefault(s => s.Id == ServiceId);
    }

    [RelayCommand]
    private void PreviousMonth()
    {
        DisplayMonth = DisplayMonth.AddMonths(-1);
        BuildCalendar();
    }

    [RelayCommand]
    private void NextMonth()
    {
        DisplayMonth = DisplayMonth.AddMonths(1);
        BuildCalendar();
    }

    private void BuildCalendar()
    {
        CalendarDays.Clear();
        var first = DisplayMonth;
        var daysInMonth = DateTime.DaysInMonth(first.Year, first.Month);
        var startDow = (int)first.DayOfWeek;
        // Fill leading blanks (Mon=0 start)
        var offset = startDow == 0 ? 6 : startDow - 1;
        for (int i = 0; i < offset; i++)
            CalendarDays.Add(new CalendarDay { IsBlank = true });
        for (int d = 1; d <= daysInMonth; d++)
        {
            var date = new DateTime(first.Year, first.Month, d);
            CalendarDays.Add(new CalendarDay
            {
                Date = date,
                DayNumber = d.ToString(),
                IsPast = date.Date < DateTime.Today,
                IsToday = date.Date == DateTime.Today,
                IsSelected = date.Date == SelectedDate.Date
            });
        }
    }

    [RelayCommand]
    private async Task SelectDateAsync(CalendarDay day)
    {
        if (day.IsPast || day.IsBlank) return;
        SelectedDate = day.Date;
        SelectedTimeSlot = null;
        BuildCalendar();
        await LoadTimeSlotsAsync();
    }

    private async Task LoadTimeSlotsAsync()
    {
        IsBusy = true;
        try
        {
            var duration = Service?.DurationMinutes ?? 60;
            var slots = await _bookingService.GetAvailableSlotsAsync(BusinessId!, StaffId, SelectedDate, duration);
            TimeSlots.Clear();
            foreach (var s in slots) TimeSlots.Add(s);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void SelectTimeSlot(TimeSlot slot)
    {
        if (!slot.IsAvailable) return;
        SelectedTimeSlot = slot;
    }

    [RelayCommand]
    private async Task ContinueAsync()
    {
        if (SelectedTimeSlot == null) return;
        var dt = Uri.EscapeDataString(SelectedTimeSlot.DateTime.ToString("o"));
        var staffParam = !string.IsNullOrEmpty(StaffId) ? $"&staffId={StaffId}" : "";
        await Shell.Current.GoToAsync(
            $"{AppConstants.RoutePayment}?businessId={BusinessId}&serviceId={ServiceId}&dateTime={dt}{staffParam}");
    }
}

public class CalendarDay
{
    public DateTime Date { get; set; }
    public string DayNumber { get; set; } = string.Empty;
    public bool IsPast { get; set; }
    public bool IsToday { get; set; }
    public bool IsSelected { get; set; }
    public bool IsBlank { get; set; }

    public string TextColor => IsPast ? "#555555" : IsSelected ? "#0A0A0A" : "#FFFFFF";
    public string BackgroundColor => IsSelected ? "#C9A84C" : IsToday ? "#2A2A2A" : "Transparent";
    public bool IsEnabled => !IsPast && !IsBlank;
}
