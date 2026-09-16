namespace Reserve_Your_Spot.Models;

/// <summary>
/// A stretch of time a business has marked itself (or one staff member) as
/// unavailable — holiday, lunch, a personal appointment, whatever. Customers
/// never see this as anything other than a normal unavailable time slot.
/// </summary>
public class BlockedTime
{
    public string Id { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;

    /// <summary>Null = the whole business is closed for this window, not just one person.</summary>
    public string? StaffId { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }

    public string DateDisplay => StartTime.Date == EndTime.Date
        ? StartTime.ToString("ddd d MMM")
        : $"{StartTime:ddd d MMM} → {EndTime:ddd d MMM}";

    public string TimeDisplay => $"{StartTime:HH:mm} – {EndTime:HH:mm}";
}
