using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class FavouritesPage : ContentPage
{
    private readonly FavouritesViewModel _vm;

    public FavouritesPage(FavouritesViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = vm;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _vm.LoadFavouritesCommand.Execute(null);
    }

    private async void OnBusinessTapped(object sender, Business business)
        => await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={business.Id}");
}
