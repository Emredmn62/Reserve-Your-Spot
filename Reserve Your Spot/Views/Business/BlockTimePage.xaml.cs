using Reserve_Your_Spot.ViewModels.BusinessPortal;

namespace Reserve_Your_Spot.Views.BusinessPortal;

public partial class BlockTimePage : ContentPage
{
    private readonly BlockTimeViewModel _vm;

    public BlockTimePage(BlockTimeViewModel vm)
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
