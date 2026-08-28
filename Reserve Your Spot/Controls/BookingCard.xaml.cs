using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Controls;

public partial class BookingCard : ContentView
{
    public static readonly BindableProperty BookingProperty =
        BindableProperty.Create(nameof(Booking), typeof(Booking), typeof(BookingCard), null,
            propertyChanged: (b, o, n) => ((BookingCard)b).UpdateUI((Booking?)n));

    public Booking? Booking
    {
        get => (Booking?)GetValue(BookingProperty);
        set => SetValue(BookingProperty, value);
    }

    public BookingCard()
    {
        InitializeComponent();
    }

    private void UpdateUI(Booking? b)
    {
        if (b == null) return;
        TimeLabel.Text = b.TimeDisplay;
        DateLabel.Text = b.DateDisplay;
        BusinessLabel.Text = b.Business?.Name ?? "Business";
        ServiceLabel.Text = b.Service?.Name ?? string.Empty;
        StatusLabel.Text = b.StatusLabel;
        PriceLabel.Text = $"£{b.TotalPrice:F2}";
        StatusBadge.BackgroundColor = Color.FromArgb(b.StatusColor);
    }
}
