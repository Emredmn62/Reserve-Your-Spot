using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Onboarding;

public partial class OnboardingPage : ContentPage
{
    public OnboardingPage(OnboardingViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }

    private void OnSlideChanged(object sender, CurrentItemChangedEventArgs e)
    {
        if (BindingContext is OnboardingViewModel vm && e.CurrentItem is OnboardingSlide slide)
            vm.CurrentIndex = vm.Slides.IndexOf(slide);
    }
}
