using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

[QueryProperty(nameof(BusinessId), "businessId")]
public partial class ServiceSelectionViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;

    [ObservableProperty] private string? _businessId;
    [ObservableProperty] private Business? _business;
    [ObservableProperty] private List<Service> _services = new();
    [ObservableProperty] private Service? _selectedService;
    [ObservableProperty] private bool _canContinue;

    public ServiceSelectionViewModel(IBusinessService businessService)
    {
        _businessService = businessService;
        Title = "Choose a Service";
    }

    partial void OnBusinessIdChanged(string? value)
    {
        if (!string.IsNullOrEmpty(value)) _ = LoadAsync();
    }

    partial void OnSelectedServiceChanged(Service? value)
        => CanContinue = value != null;

    [RelayCommand]
    private async Task LoadAsync()
    {
        if (string.IsNullOrEmpty(BusinessId)) return;
        IsBusy = true;
        try
        {
            Business = await _businessService.GetBusinessByIdAsync(BusinessId);
            Services = await _businessService.GetServicesAsync(BusinessId);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void SelectService(Service service) => SelectedService = service;

    [RelayCommand]
    private async Task ContinueAsync()
    {
        if (SelectedService == null || Business == null) return;
        await Shell.Current.GoToAsync(
            $"{AppConstants.RouteStaffSelection}?businessId={Business.Id}&serviceId={SelectedService.Id}");
    }
}
