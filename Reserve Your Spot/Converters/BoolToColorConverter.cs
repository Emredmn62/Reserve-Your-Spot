using System.Globalization;

namespace Reserve_Your_Spot.Converters;

public class BoolToColorConverter : IValueConverter
{
    public Color TrueColor { get; set; } = Colors.Gold;
    public Color FalseColor { get; set; } = Colors.Gray;

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is bool b && b ? TrueColor : FalseColor;

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
