using Reserve_Your_Spot.ViewModels.BusinessPortal;

namespace Reserve_Your_Spot.Views.BusinessPortal;

public partial class CreatePostPage : ContentPage
{
    public CreatePostPage(CreatePostViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
