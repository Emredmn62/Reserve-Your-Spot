using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Controls;

public partial class BusinessCard : ContentView
{
    public static readonly BindableProperty BusinessProperty =
        BindableProperty.Create(nameof(Business), typeof(Business), typeof(BusinessCard), null,
            propertyChanged: (b, o, n) => ((BusinessCard)b).UpdateUI((Business?)n));

    public Business? Business
    {
        get => (Business?)GetValue(BusinessProperty);
        set => SetValue(BusinessProperty, value);
    }

    public event EventHandler<Business>? BusinessTapped;

    public BusinessCard()
    {
        InitializeComponent();
        var tap = new TapGestureRecognizer();
        tap.Tapped += (s, e) =>
        {
            if (Business != null) BusinessTapped?.Invoke(this, Business);
        };
        GestureRecognizers.Add(tap);
    }

    private void UpdateUI(Business? b)
    {
        if (b == null) return;
        NameLabel.Text = b.Name;
        RatingLabel.Text = b.Rating > 0 ? $"⭐ {b.Rating:F1}" : "New";
        ReviewsLabel.Text = b.TotalReviews > 0 ? $"({b.TotalReviews})" : string.Empty;
        DistanceLabel.Text = b.DistanceDisplay;
        CategoryLabel.Text = b.Category?.Name ?? string.Empty;
        FeaturedBadge.IsVisible = b.IsFeatured;
        if (!string.IsNullOrEmpty(b.CoverImageUrl))
            CoverImg.Source = ImageSource.FromUri(new Uri(b.CoverImageUrl));
    }
}
