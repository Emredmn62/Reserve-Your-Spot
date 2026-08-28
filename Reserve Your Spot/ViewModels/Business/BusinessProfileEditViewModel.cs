using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

public partial class BusinessProfileEditViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private Models.Business? _original;

    [ObservableProperty] private string _name = string.Empty;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private string _address = string.Empty;
    [ObservableProperty] private string _phone = string.Empty;
    [ObservableProperty] private string _instagramUrl = string.Empty;
    [ObservableProperty] private string _websiteUrl = string.Empty;
    [ObservableProperty] private string _whatsAppNumber = string.Empty;
    [ObservableProperty] private decimal _depositPercentage = 20;
    [ObservableProperty] private string _cancellationPolicy = string.Empty;
    [ObservableProperty] private string _selectedCategoryId = string.Empty;
    [ObservableProperty] private bool _isSaved;

    public List<Category> Categories { get; } = Category.Defaults;

    public BusinessProfileEditViewModel(IBusinessService businessService, IAuthService authService)
    {
        _businessService = businessService;
        _authService = authService;
        Title = "Edit Business Profile";
    }

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var uid = _authService.CurrentUserId;
            if (uid == null) return;
            _original = await _businessService.GetBusinessByOwnerAsync(uid);
            if (_original == null) return;
            Name = _original.Name;
            Description = _original.Description;
            Address = _original.Address;
            Phone = _original.Phone;
            InstagramUrl = _original.InstagramUrl ?? string.Empty;
            WebsiteUrl = _original.WebsiteUrl ?? string.Empty;
            WhatsAppNumber = _original.WhatsAppNumber ?? string.Empty;
            DepositPercentage = _original.DepositPercentage;
            CancellationPolicy = _original.CancellationPolicy;
            SelectedCategoryId = _original.CategoryId;
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SaveAsync()
    {
        if (_original == null) return;
        IsBusy = true;
        ClearError();
        try
        {
            _original.Name = Name;
            _original.Description = Description;
            _original.Address = Address;
            _original.Phone = Phone;
            _original.InstagramUrl = InstagramUrl;
            _original.WebsiteUrl = WebsiteUrl;
            _original.WhatsAppNumber = WhatsAppNumber;
            _original.DepositPercentage = DepositPercentage;
            _original.CancellationPolicy = CancellationPolicy;
            _original.CategoryId = SelectedCategoryId;
            await _businessService.UpdateBusinessAsync(_original);
            IsSaved = true;
            await Shell.Current.DisplayAlert("Saved", "Your profile has been updated.", "OK");
            await Shell.Current.GoToAsync("..");
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }
}
