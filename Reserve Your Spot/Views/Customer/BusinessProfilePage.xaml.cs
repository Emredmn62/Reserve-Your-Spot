using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.ViewModels;

namespace Reserve_Your_Spot.Views.Customer;

public partial class BusinessProfilePage : ContentPage
{
    private readonly BusinessProfileViewModel _vm;

    public BusinessProfilePage(BusinessProfileViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        BindingContext = vm;
        vm.PropertyChanged += OnVmPropertyChanged;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        if (!string.IsNullOrEmpty(_vm.BusinessId))
            _vm.LoadBusinessCommand.Execute(null);
    }

    private void OnVmPropertyChanged(object? sender, System.ComponentModel.PropertyChangedEventArgs e)
    {
        if (e.PropertyName == nameof(_vm.Business)) UpdateBusinessUI();
        if (e.PropertyName == nameof(_vm.IsFavourite)) FavIcon.Text = _vm.IsFavourite ? "❤️" : "🤍";
        if (e.PropertyName == nameof(_vm.SelectedTab)) UpdateTabUI();
    }

    private void UpdateBusinessUI()
    {
        var b = _vm.Business;
        if (b == null) return;
        BusinessNameLabel.Text = b.Name;
        CategoryLabel.Text = b.Category?.Name ?? string.Empty;
        RatingLabel.Text = b.Rating > 0 ? $"⭐ {b.Rating:F1}" : "New";
        ReviewCountLabel.Text = b.TotalReviews > 0 ? $"({b.TotalReviews} reviews)" : string.Empty;
        AddressLabel.Text = $"📍 {b.Address}";
        LogoInitials.Text = string.Join("", b.Name.Split(' ').Take(2).Select(w => w.FirstOrDefault()));
        if (!string.IsNullOrEmpty(b.CoverImageUrl))
            CoverImage.Source = ImageSource.FromUri(new Uri(b.CoverImageUrl));
        DescriptionLabel.Text = b.Description;
        InfoAddressLabel.Text = b.Address;
        CancellationLabel.Text = string.IsNullOrEmpty(b.CancellationPolicy)
            ? "Contact business for cancellation policy."
            : b.CancellationPolicy;
    }

    private void UpdateTabUI()
    {
        var tab = _vm.SelectedTab;
        ServicesPanel.IsVisible = tab == "Services";
        StaffPanel.IsVisible    = tab == "Staff";
        ReviewsPanel.IsVisible  = tab == "Reviews";
        InfoPanel.IsVisible     = tab == "Info";

        TabServices.TextColor = tab == "Services" ? Color.FromArgb("#C9A84C") : Color.FromArgb("#888888");
        TabStaff.TextColor    = tab == "Staff"    ? Color.FromArgb("#C9A84C") : Color.FromArgb("#888888");
        TabReviews.TextColor  = tab == "Reviews"  ? Color.FromArgb("#C9A84C") : Color.FromArgb("#888888");
        TabInfo.TextColor     = tab == "Info"     ? Color.FromArgb("#C9A84C") : Color.FromArgb("#888888");
    }

    private async void OnServiceTapped(object sender, Service service)
        => await Shell.Current.GoToAsync($"serviceselection?businessId={_vm.BusinessId}");

    private async void OnBackTapped(object sender, TappedEventArgs e)
        => await Shell.Current.GoToAsync("..");
}
