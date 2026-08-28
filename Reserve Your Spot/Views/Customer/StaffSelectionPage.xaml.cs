using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class StaffSelectionPage : ContentPage
{
    public StaffSelectionPage(StaffSelectionViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
