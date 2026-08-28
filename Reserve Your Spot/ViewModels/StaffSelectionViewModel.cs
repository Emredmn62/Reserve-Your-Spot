using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

[QueryProperty(nameof(BusinessId), "businessId")]
[QueryProperty(nameof(ServiceId), "serviceId")]
public partial class StaffSelectionViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;

    [ObservableProperty] private string? _businessId;
    [ObservableProperty] private string? _serviceId;
    [ObservableProperty] private Business? _business;
    [ObservableProperty] private Service? _service;
    [ObservableProperty] private List<Staff> _staffList = new();
    [ObservableProperty] private Staff? _selectedStaff;   // null = any available

    public StaffSelectionViewModel(IBusinessService businessService)
    {
        _businessService = businessService;
        Title = "Choose a Team Member";
    }

    partial void OnBusinessIdChanged(string? value) { if (value != null && ServiceId != null) _ = LoadAsync(); }
    partial void OnServiceIdChanged(string? value)  { if (value != null && BusinessId != null) _ = LoadAsync(); }

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            Business = await _businessService.GetBusinessByIdAsync(BusinessId!);
            StaffList = await _businessService.GetStaffAsync(BusinessId!);
            var allServices = await _businessService.GetServicesAsync(BusinessId!);
            Service = allServices.FirstOrDefault(s => s.Id == ServiceId);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void SelectAnyStaff() => SelectedStaff = null;

    [RelayCommand]
    private void SelectStaff(Staff staff) => SelectedStaff = staff;

    [RelayCommand]
    private async Task ContinueAsync()
    {
        var staffParam = SelectedStaff != null ? $"&staffId={SelectedStaff.Id}" : "";
        await Shell.Current.GoToAsync(
            $"{AppConstants.RouteDateTimeSelection}?businessId={BusinessId}&serviceId={ServiceId}{staffParam}");
    }
}
