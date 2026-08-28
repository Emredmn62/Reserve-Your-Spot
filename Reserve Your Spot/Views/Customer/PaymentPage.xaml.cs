using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class PaymentPage : ContentPage
{
    public PaymentPage(PaymentViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
