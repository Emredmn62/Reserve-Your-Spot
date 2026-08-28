using System.Globalization;

namespace Reserve_Your_Spot.Converters;

public class PriceFormatter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is decimal d) return $"£{d:F2}";
        if (value is double dbl) return $"£{dbl:F2}";
        if (value is float f) return $"£{f:F2}";
        return "£0.00";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
