using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class DateTimeSelectionPage : ContentPage
{
    public DateTimeSelectionPage(DateTimeSelectionViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
