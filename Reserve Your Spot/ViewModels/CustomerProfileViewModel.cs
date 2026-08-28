using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

public partial class CustomerProfileViewModel : BaseViewModel
{
    private readonly IAuthService _authService;
    private readonly SupabaseService _supabase;

    [ObservableProperty] private User? _currentUser;
    [ObservableProperty] private string _userInitials = "U";

    public ObservableCollection<LoyaltyCard> LoyaltyCards { get; } = new();

    public CustomerProfileViewModel(IAuthService authService, SupabaseService supabase)
    {
        _authService = authService;
        _supabase = supabase;
        Title = "My Profile";
    }

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            CurrentUser = await _authService.GetCurrentUserAsync();
            if (CurrentUser != null)
                UserInitials = string.Join("", CurrentUser.FullName.Split(' ').Take(2).Select(n => n.FirstOrDefault()));

            var uid = _authService.CurrentUserId;
            if (uid != null)
            {
                var cards = await _supabase.GetListAsync<LoyaltyCard>("loyalty_cards",
                    $"customer_id=eq.{uid}&select=*");
                LoyaltyCards.Clear();
                foreach (var c in cards) LoyaltyCards.Add(c);
            }
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task SignOutAsync()
    {
        await _authService.SignOutAsync();
        await Shell.Current.GoToAsync(AppConstants.RouteLogin);
    }

    [RelayCommand]
    private async Task EditProfileAsync()
        => await Shell.Current.DisplayAlert("Edit Profile", "Profile editing coming soon!", "OK");
}
