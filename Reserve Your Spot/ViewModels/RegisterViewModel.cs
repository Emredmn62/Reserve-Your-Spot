using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

public partial class RegisterViewModel : BaseViewModel
{
    private readonly IAuthService _authService;

    [ObservableProperty] private string _fullName = string.Empty;
    [ObservableProperty] private string _email = string.Empty;
    [ObservableProperty] private string _phone = string.Empty;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private string _confirmPassword = string.Empty;
    [ObservableProperty] private bool _isBusinessOwner;
    [ObservableProperty] private bool _isPasswordVisible;

    public RegisterViewModel(IAuthService authService)
    {
        _authService = authService;
        Title = "Create Account";
    }

    [RelayCommand]
    private async Task RegisterAsync()
    {
        if (string.IsNullOrWhiteSpace(FullName) || string.IsNullOrWhiteSpace(Email) ||
            string.IsNullOrWhiteSpace(Password))
        {
            SetError("Please fill in all required fields.");
            return;
        }
        if (Password != ConfirmPassword)
        {
            SetError("Passwords do not match.");
            return;
        }
        if (Password.Length < 6)
        {
            SetError("Password must be at least 6 characters.");
            return;
        }
        ClearError();
        IsBusy = true;
        try
        {
            var success = await _authService.SignUpAsync(Email, Password, FullName, Phone, IsBusinessOwner);
            if (success)
            {
                if (IsBusinessOwner)
                    await Shell.Current.GoToAsync(AppConstants.RouteBusinessRegister);
                else
                    await Shell.Current.GoToAsync(AppConstants.RouteHome);
            }
            else
            {
                SetError("Registration failed. This email may already be in use.");
            }
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task NavigateToLoginAsync()
        => await Shell.Current.GoToAsync(AppConstants.RouteLogin);

    [RelayCommand]
    private void TogglePasswordVisibility() => IsPasswordVisible = !IsPasswordVisible;
}
