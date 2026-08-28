using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Controls;

public partial class ServiceCard : ContentView
{
    public static readonly BindableProperty ServiceProperty =
        BindableProperty.Create(nameof(Service), typeof(Service), typeof(ServiceCard), null,
            propertyChanged: (b, o, n) => ((ServiceCard)b).UpdateUI((Service?)n));

    public static readonly BindableProperty IsSelectedProperty =
        BindableProperty.Create(nameof(IsSelected), typeof(bool), typeof(ServiceCard), false,
            propertyChanged: (b, o, n) => ((ServiceCard)b).UpdateSelection((bool)n));

    public Service? Service
    {
        get => (Service?)GetValue(ServiceProperty);
        set => SetValue(ServiceProperty, value);
    }

    public bool IsSelected
    {
        get => (bool)GetValue(IsSelectedProperty);
        set => SetValue(IsSelectedProperty, value);
    }

    public event EventHandler<Service>? ServiceTapped;

    public ServiceCard()
    {
        InitializeComponent();
        var tap = new TapGestureRecognizer();
        tap.Tapped += (s, e) =>
        {
            if (Service != null) ServiceTapped?.Invoke(this, Service);
        };
        GestureRecognizers.Add(tap);
    }

    private void UpdateUI(Service? s)
    {
        if (s == null) return;
        NameLabel.Text = s.Name;
        DurationLabel.Text = $"⏱ {s.DurationDisplay}";
        DescLabel.Text = s.Description;
        PriceLabel.Text = $"£{s.Price:F2}";
        DepositLabel.Text = s.DepositAmount > 0 ? $"Deposit: £{s.DepositAmount:F2}" : string.Empty;
    }

    private void UpdateSelection(bool selected)
    {
        CardBorder.Stroke = selected
            ? Color.FromArgb("#C9A84C")
            : Color.FromArgb("#2A2A2A");
        CardBorder.StrokeThickness = selected ? 2 : 1.5;
    }
}
