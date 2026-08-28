using Reserve_Your_Spot.ViewModels.BusinessPortal;

namespace Reserve_Your_Spot.Views.BusinessPortal;

public partial class DashboardPage : ContentPage
{
    private readonly DashboardViewModel _vm;

    public DashboardPage(DashboardViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = vm;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _vm.LoadDataCommand.Execute(null);
    }
}
