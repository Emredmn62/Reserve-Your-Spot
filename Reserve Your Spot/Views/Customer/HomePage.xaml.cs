using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class HomePage : ContentPage
{
    private readonly HomeViewModel _vm;

    public HomePage(HomeViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = vm;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _vm.LoadDataCommand.Execute(null);
    }

    private async void OnBusinessTapped(object sender, Business business)
        => await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={business.Id}");
}
