using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Auth;

public partial class LoginPage : ContentPage
{
    public LoginPage(LoginViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
        // Expose AppName for binding
        vm.Title = AppConstants.AppName;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (BindingContext is LoginViewModel vm)
        {
            // Inject app name as bindable property via resources
            Resources["AppName"] = AppConstants.AppName;
        }
    }
}
