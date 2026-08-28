namespace Reserve_Your_Spot.Models;

public class Staff
{
    public string Id { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? PhotoUrl { get; set; }
    public string? Bio { get; set; }
    public Dictionary<string, WorkingHours> WorkingHours { get; set; } = new();
    public List<DateTime> DaysOff { get; set; } = new();
    public bool IsActive { get; set; } = true;
}

public class WorkingHours
{
    public string Start { get; set; } = "09:00";
    public string End { get; set; } = "17:00";
    public bool IsWorking { get; set; } = true;
}
