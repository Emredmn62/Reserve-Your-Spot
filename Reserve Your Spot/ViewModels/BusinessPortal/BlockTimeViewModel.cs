using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

/// <summary>One entry in the "who is this block for" picker.</summary>
public class StaffOption
{
    public string Label { get; set; } = string.Empty;
    public Staff? Staff { get; set; } // null = whole business
}

public partial class BlockTimeViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private string? _businessId;

    [ObservableProperty] private DateTime _selectedDate = DateTime.Today;
    [ObservableProperty] private TimeSpan _startTime = new(9, 0, 0);
    [ObservableProperty] private TimeSpan _endTime = new(10, 0, 0);
    [ObservableProperty] private StaffOption? _selectedStaffOption;
    [ObservableProperty] private string _note = string.Empty;

    public ObservableCollection<StaffOption> StaffOptions { get; } = new();
    public ObservableCollection<BlockedTime> Blocks { get; } = new();

    public BlockTimeViewModel(IBookingService bookingService, IBusinessService businessService, IAuthService authService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        _authService = authService;
        Title = "Block Time";
    }

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        ClearError();
        try
        {
            var uid = _authService.CurrentUserId;
            if (uid == null) return;
            var business = await _businessService.GetBusinessByOwnerAsync(uid);
            if (business == null) { SetError("Set up your business first."); return; }
            _businessId = business.Id;

            StaffOptions.Clear();
            StaffOptions.Add(new StaffOption { Label = "Whole business (all staff)" });
            var staff = await _businessService.GetStaffAsync(business.Id);
            foreach (var s in staff)
                StaffOptions.Add(new StaffOption { Label = s.Name, Staff = s });
            SelectedStaffOption = StaffOptions.FirstOrDefault();

            await RefreshBlocksAsync();
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }

    private async Task RefreshBlocksAsync()
    {
        if (_businessId == null) return;
        var blocks = await _bookingService.GetBlockedTimesAsync(_businessId);
        Blocks.Clear();
        foreach (var b in blocks.Where(b => b.EndTime >= DateTime.Now).OrderBy(b => b.StartTime))
            Blocks.Add(b);
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (_businessId == null) return;

        var start = SelectedDate.Date + StartTime;
        var end = SelectedDate.Date + EndTime;
        if (end <= start)
        {
            SetError("End time must be after the start time.");
            return;
        }

        IsBusy = true;
        ClearError();
        try
        {
            await _bookingService.CreateBlockedTimeAsync(new BlockedTime
            {
                BusinessId = _businessId,
                StaffId = SelectedStaffOption?.Staff?.Id,
                StartTime = start,
                EndTime = end,
                Note = string.IsNullOrWhiteSpace(Note) ? null : Note.Trim()
            });
            Note = string.Empty;
            await RefreshBlocksAsync();
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task DeleteAsync(BlockedTime block)
    {
        var confirm = await Shell.Current.DisplayAlert(
            "Remove block", "This time will become bookable again.", "Remove", "Cancel");
        if (!confirm) return;

        await _bookingService.DeleteBlockedTimeAsync(block.Id);
        await RefreshBlocksAsync();
    }
}
