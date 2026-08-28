using System.Globalization;

namespace Reserve_Your_Spot.Converters;

public class DateFormatter : IValueConverter
{
    /// <summary>
    /// Parameter: "short" => "Mon 21 Jun", "long" => "21 Jun 2026, 14:30", default = "short"
    /// </summary>
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is not DateTime dt) return string.Empty;
        var fmt = parameter as string;
        return fmt == "long"
            ? dt.ToString("d MMM yyyy, HH:mm")
            : dt.ToString("ddd d MMM");
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
