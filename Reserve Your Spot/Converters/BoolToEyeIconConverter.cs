using System.Globalization;

namespace Reserve_Your_Spot.Converters;

/// <summary>
/// Maps a "password visible" bool to an eye icon: true => "🙈" (tap to hide), false => "👁" (tap to show).
/// </summary>
public class BoolToEyeIconConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is bool b && b ? "🙈" : "👁";

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
