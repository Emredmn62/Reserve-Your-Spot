using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

public partial class FavouritesViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;

    public ObservableCollection<Business> FavouriteBusinesses { get; } = new();

    public FavouritesViewModel(IBusinessService businessService, IAuthService authService)
    {
        _businessService = businessService;
        _authService = authService;
        Title = "Favourites";
    }

    [RelayCommand]
    private async Task LoadFavouritesAsync()
    {
        var uid = _authService.CurrentUserId;
        if (string.IsNullOrEmpty(uid)) return;
        IsBusy = true;
        try
        {
            var favs = await _businessService.GetFavouritesAsync(uid);
            FavouriteBusinesses.Clear();
            foreach (var b in favs) FavouriteBusinesses.Add(b);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task NavigateToBusinessAsync(Business business)
        => await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={business.Id}");
}
