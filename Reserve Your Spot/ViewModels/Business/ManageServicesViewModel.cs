using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

public partial class ManageServicesViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private string? _businessId;

    [ObservableProperty] private bool _isAddingService;
    [ObservableProperty] private Service? _editingService;

    // New service form fields
    [ObservableProperty] private string _newServiceName = string.Empty;
    [ObservableProperty] private string _newServiceDescription = string.Empty;
    [ObservableProperty] private int _newServiceDuration = 60;
    [ObservableProperty] private decimal _newServicePrice;
    [ObservableProperty] private decimal _newServiceDeposit;

    public ObservableCollection<Service> Services { get; } = new();

    public ManageServicesViewModel(IBusinessService businessService, IAuthService authService)
    {
        _businessService = businessService;
        _authService = authService;
        Title = "Manage Services";
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
            if (_businessId == null) return;
            var services = await _businessService.GetServicesAsync(_businessId);
            Services.Clear();
            foreach (var s in services) Services.Add(s);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void ShowAddForm()
    {
        IsAddingService = true;
        EditingService = null;
        ClearForm();
    }

    [RelayCommand]
    private void EditService(Service service)
    {
        EditingService = service;
        NewServiceName = service.Name;
        NewServiceDescription = service.Description;
        NewServiceDuration = service.DurationMinutes;
        NewServicePrice = service.Price;
        NewServiceDeposit = service.DepositAmount;
        IsAddingService = true;
    }

    [RelayCommand]
    private async Task SaveServiceAsync()
    {
        if (string.IsNullOrWhiteSpace(NewServiceName) || _businessId == null) return;
        IsBusy = true;
        try
        {
            if (EditingService != null)
            {
                EditingService.Name = NewServiceName;
                EditingService.Description = NewServiceDescription;
                EditingService.DurationMinutes = NewServiceDuration;
                EditingService.Price = NewServicePrice;
                EditingService.DepositAmount = NewServiceDeposit;
                await _businessService.UpdateServiceAsync(EditingService);
            }
            else
            {
                var service = new Service
                {
                    BusinessId = _businessId,
                    Name = NewServiceName,
                    Description = NewServiceDescription,
                    DurationMinutes = NewServiceDuration,
                    Price = NewServicePrice,
                    DepositAmount = NewServiceDeposit,
                    IsActive = true
                };
                await _businessService.AddServiceAsync(service);
            }
            IsAddingService = false;
            await LoadAsync();
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task DeleteServiceAsync(Service service)
    {
        var confirm = await Shell.Current.DisplayAlert("Delete", $"Delete '{service.Name}'?", "Delete", "Cancel");
        if (!confirm) return;
        await _businessService.DeleteServiceAsync(service.Id);
        await LoadAsync();
    }

    [RelayCommand]
    private void Cancel() { IsAddingService = false; ClearForm(); }

    private void ClearForm()
    {
        NewServiceName = string.Empty;
        NewServiceDescription = string.Empty;
        NewServiceDuration = 60;
        NewServicePrice = 0;
        NewServiceDeposit = 0;
        EditingService = null;
    }
}
