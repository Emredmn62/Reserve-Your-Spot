using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class ServiceSelectionPage : ContentPage
{
    private readonly ServiceSelectionViewModel _vm;

    public ServiceSelectionPage(ServiceSelectionViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = vm;
    }

    private void OnServiceTapped(object sender, Service service)
    {
        _vm.SelectServiceCommand.Execute(service);
    }
}
