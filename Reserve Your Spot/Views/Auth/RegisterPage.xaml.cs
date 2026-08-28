using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Auth;

public partial class RegisterPage : ContentPage
{
    public RegisterPage(RegisterViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
