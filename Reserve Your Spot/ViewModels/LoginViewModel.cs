using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

public partial class LoginViewModel : BaseViewModel
{
    private readonly IAuthService _authService;

    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private bool _isPasswordVisible;

    public LoginViewModel(IAuthService authService)
    {
        _authService = authService;
        Title = "Sign In";
    }

    [RelayCommand]
    private async Task SignInAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            SetError("Please enter your email and password.");
            return;
        }
        ClearError();
        IsBusy = true;
        try
        {
            var success = await _authService.SignInAsync(Email, Password);
            if (success)
            {
                var route = _authService.IsBusinessOwner
                    ? AppConstants.RouteBusinessDashboard
                    : AppConstants.RouteHome;
                await Shell.Current.GoToAsync(route);
            }
            else
            {
                SetError("Invalid email or password. Please try again.");
            }
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task NavigateToRegisterAsync()
        => await Shell.Current.GoToAsync(AppConstants.RouteRegister);

    [RelayCommand]
    private void TogglePasswordVisibility() => IsPasswordVisible = !IsPasswordVisible;
}
