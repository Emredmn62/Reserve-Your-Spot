using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

[QueryProperty(nameof(BusinessId), "businessId")]
public partial class BusinessProfileViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;

    [ObservableProperty] private string? _businessId;
    [ObservableProperty] private Business? _business;
    [ObservableProperty] private List<Service> _services = new();
    [ObservableProperty] private List<Staff> _staff = new();
    [ObservableProperty] private List<Review> _reviews = new();
    [ObservableProperty] private bool _isFavourite;
    [ObservableProperty] private string _selectedTab = "Services";

    public BusinessProfileViewModel(IBusinessService businessService, IAuthService authService)
    {
        _businessService = businessService;
        _authService = authService;
    }

    partial void OnBusinessIdChanged(string? value)
    {
        if (!string.IsNullOrEmpty(value))
            _ = LoadBusinessAsync();
    }

    [RelayCommand]
    private async Task LoadBusinessAsync()
    {
        if (string.IsNullOrEmpty(BusinessId)) return;
        IsBusy = true;
        ClearError();
        try
        {
            Business = await _businessService.GetBusinessByIdAsync(BusinessId);
            if (Business != null)
            {
                Title = Business.Name;
                Services = await _businessService.GetServicesAsync(BusinessId);
                Staff = await _businessService.GetStaffAsync(BusinessId);
                Reviews = await _businessService.GetReviewsAsync(BusinessId);
                var uid = _authService.CurrentUserId;
                if (uid != null)
                    IsFavourite = await _businessService.IsFavouriteAsync(uid, BusinessId);
            }
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task ToggleFavouriteAsync()
    {
        var uid = _authService.CurrentUserId;
        if (uid == null || BusinessId == null) return;
        IsFavourite = await _businessService.ToggleFavouriteAsync(uid, BusinessId);
    }

    [RelayCommand]
    private async Task BookNowAsync()
    {
        if (Business == null) return;
        await Shell.Current.GoToAsync($"{AppConstants.RouteServiceSelection}?businessId={Business.Id}");
    }

    [RelayCommand]
    private void SelectTab(string tab) => SelectedTab = tab;

    [RelayCommand]
    private void Call()
    {
        if (Business?.Phone != null)
            Launcher.OpenAsync(new Uri($"tel:{Business.Phone}"));
    }

    [RelayCommand]
    private void WhatsApp()
    {
        if (Business?.WhatsAppNumber != null)
            Launcher.OpenAsync(new Uri($"https://wa.me/{Business.WhatsAppNumber}"));
    }

    [RelayCommand]
    private async Task Share()
    {
        if (Business == null) return;
        await Microsoft.Maui.ApplicationModel.DataTransfer.Share.Default.RequestAsync(new ShareTextRequest
        {
            Title = Business.Name,
            Text = $"Book {Business.Name} on {AppConstants.AppName}",
            Uri = Business.WebsiteUrl ?? ""
        });
    }
}
