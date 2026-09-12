using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Services;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class CustomerProfilePage : ContentPage
{
    private readonly CustomerProfileViewModel _vm;
    private readonly IAuthService _authService;

    public CustomerProfilePage(CustomerProfileViewModel vm, IAuthService authService)
    {
        InitializeComponent();
        _vm = vm;
        _authService = authService;
        BindingContext = vm;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        if (!_authService.IsLoggedIn)
        {
            await Shell.Current.GoToAsync(AppConstants.RouteLogin);
            return;
        }
        _vm.LoadCommand.Execute(null);
    }
}
