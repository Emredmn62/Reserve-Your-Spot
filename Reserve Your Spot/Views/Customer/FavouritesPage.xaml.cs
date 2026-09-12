using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class FavouritesPage : ContentPage
{
    private readonly FavouritesViewModel _vm;
    private readonly IAuthService _authService;

    public FavouritesPage(FavouritesViewModel vm, IAuthService authService)
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
        _vm.LoadFavouritesCommand.Execute(null);
    }

    private async void OnBusinessTapped(object sender, Business business)
        => await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={business.Id}");
}
