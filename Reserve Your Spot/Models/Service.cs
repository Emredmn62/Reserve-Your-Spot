namespace Reserve_Your_Spot.Models;

public class Service
{
    public string Id { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public decimal Price { get; set; }
    public decimal DepositAmount { get; set; }
    public string? CategoryTag { get; set; }
    public bool IsActive { get; set; } = true;

    public string DurationDisplay => DurationMinutes >= 60
        ? $"{DurationMinutes / 60}h {(DurationMinutes % 60 > 0 ? $"{DurationMinutes % 60}m" : "")}".Trim()
        : $"{DurationMinutes}m";

    public decimal RemainingBalance => Price - DepositAmount;
}
