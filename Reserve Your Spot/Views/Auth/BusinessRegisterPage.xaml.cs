using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.Views.Auth;

public partial class BusinessRegisterPage : ContentPage
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private readonly IReferralService _referralService;

    public BusinessRegisterPage(IBusinessService businessService, IAuthService authService, IReferralService referralService)
    {
        InitializeComponent();
        _businessService = businessService;
        _authService = authService;
        _referralService = referralService;

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
        var referral = ReferralEntry.Text?.Trim();
        var category = CategoryPicker.SelectedItem as Category;

        if (string.IsNullOrEmpty(name) || string.IsNullOrEmpty(address) || category == null)
        {
            await DisplayAlert("Missing Info", "Please fill in all required fields.", "OK");
            return;
        }

        if (string.IsNullOrEmpty(referral))
        {
            await DisplayAlert("Invite code required",
                "Reserve Your Spot is invite-only for now. Enter the code you were given.", "OK");
            return;
        }

        BusyIndicator.IsVisible = BusyIndicator.IsRunning = true;
        CompleteBtn.IsEnabled = false;
        try
        {
            if (!await _referralService.IsValidAsync(referral))
            {
                await DisplayAlert("Invalid code",
                    "That invite code isn't valid or has already been used. Each code works for one business.", "OK");
                return;
            }

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
                IsApproved = false,          // Pending until the subscription is active
                SubscriptionPlan = "pending"
            };
            var created = await _businessService.CreateBusinessAsync(business);
            if (created != null)
                await _referralService.RedeemAsync(referral, created.Id);

            await DisplayAlert("Almost there",
                "Your listing is created and pending. Start your subscription (£10/month, first 3 months free) " +
                "from the dashboard to go live and appear to customers.", "OK");
            await Shell.Current.GoToAsync(AppConstants.RouteBusinessDashboard);
        }
        finally
        {
            BusyIndicator.IsVisible = BusyIndicator.IsRunning = false;
            CompleteBtn.IsEnabled = true;
        }
    }
}
