namespace Reserve_Your_Spot.Controls;

public partial class StarRating : ContentView
{
    public static readonly BindableProperty RatingProperty =
        BindableProperty.Create(nameof(Rating), typeof(int), typeof(StarRating), 0,
            propertyChanged: (b, o, n) => ((StarRating)b).BuildStars((int)n));

    public static readonly BindableProperty StarSizeProperty =
        BindableProperty.Create(nameof(StarSize), typeof(double), typeof(StarRating), 16.0,
            propertyChanged: (b, o, n) => ((StarRating)b).BuildStars(((StarRating)b).Rating));

    public int Rating
    {
        get => (int)GetValue(RatingProperty);
        set => SetValue(RatingProperty, value);
    }

    public double StarSize
    {
        get => (double)GetValue(StarSizeProperty);
        set => SetValue(StarSizeProperty, value);
    }

    public StarRating()
    {
        InitializeComponent();
        BuildStars(0);
    }

    private void BuildStars(int rating)
    {
        StarsLayout.Children.Clear();
        for (int i = 1; i <= 5; i++)
        {
            StarsLayout.Children.Add(new Label
            {
                Text = "★",
                FontSize = StarSize,
                TextColor = i <= rating
                    ? Color.FromArgb("#C9A84C")
                    : Color.FromArgb("#555555")
            });
        }
    }
}
