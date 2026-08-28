using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class BookingConfirmationPage : ContentPage
{
    public BookingConfirmationPage(BookingConfirmationViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
