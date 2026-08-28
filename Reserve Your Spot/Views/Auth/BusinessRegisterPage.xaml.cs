using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.Views.Auth;

public partial class BusinessRegisterPage : ContentPage
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;

    public BusinessRegisterPage(IBusinessService businessService, IAuthService authService)
    {
        InitializeComponent();
        _businessService = businessService;
        _authService = authService;

        // Populate category picker
        var categories = Category.Defaults;
        CategoryPicker.ItemsSource = categories;
        CategoryPicker.ItemDisplayBinding = new Binding("Name");
    }

    private async void OnCompleteClicked(object sender, EventArgs e)
    {
        var name = BusinessNameEntry.Text?.Trim();
        var address = AddressEntry.Text?.Trim();
        var phone = PhoneEntry.Text?.Trim();
        var category = CategoryPicker.SelectedItem as Category;

        if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(address) || category == null)
        {
            await DisplayAlert("Missing Info", "Please fill in all required fields.", "OK");
            return;
        }

        BusyIndicator.IsVisible = BusyIndicator.IsRunning = true;
        CompleteBtn.IsEnabled = false;
        try
        {
            var uid = _authService.CurrentUserId;
            var business = new Business
            {
                OwnerId = uid ?? string.Empty,
                Name = name,
                Slug = name.ToLower().Replace(" ", "-"),
                Description = DescriptionEditor.Text ?? string.Empty,
                CategoryId = category.Id,
                Address = address,
                Phone = phone ?? string.Empty,
                DepositPercentage = 20,
                IsApproved = false, // pending admin approval
                SubscriptionPlan = "free"
            };
            await _businessService.CreateBusinessAsync(business);
            await Shell.Current.GoToAsync(AppConstants.RouteBusinessDashboard);
        }
        finally
        {
            BusyIndicator.IsVisible = BusyIndicator.IsRunning = false;
            CompleteBtn.IsEnabled = true;
        }
    }
}
