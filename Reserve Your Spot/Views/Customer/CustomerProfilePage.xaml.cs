using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class CustomerProfilePage : ContentPage
{
    private readonly CustomerProfileViewModel _vm;

    public CustomerProfilePage(CustomerProfileViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = vm;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _vm.LoadCommand.Execute(null);
    }
}
