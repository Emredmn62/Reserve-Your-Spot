using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class SearchPage : ContentPage
{
    public SearchPage(SearchViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }

    private async void OnBusinessTapped(object sender, Business business)
        => await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={business.Id}");
}
