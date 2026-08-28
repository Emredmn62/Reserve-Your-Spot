namespace Reserve_Your_Spot.Models;

public class TimeSlot
{
    public DateTime DateTime { get; set; }
    public bool IsAvailable { get; set; }
    public string? StaffId { get; set; }
    public bool IsLastMinute { get; set; }

    public string DisplayTime => DateTime.ToString("HH:mm");
    public string BackgroundColor => IsAvailable ? "#C9A84C" : "#2A2A2A";
    public string TextColor => IsAvailable ? "#0A0A0A" : "#555555";
    public string DisplayLabel => IsLastMinute ? $"{DisplayTime} ⚡" : DisplayTime;
}
