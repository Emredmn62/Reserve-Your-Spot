namespace Reserve_Your_Spot.Models;

public class LoyaltyCard
{
    public string Id { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public int TotalStamps { get; set; }
    public int RequiredStamps { get; set; } = 5;
    public string RewardDescription { get; set; } = string.Empty;
    public DateTime? LastStampedAt { get; set; }
    public Business? Business { get; set; }

    public bool IsComplete => TotalStamps >= RequiredStamps;
    public int StampsRemaining => Math.Max(0, RequiredStamps - TotalStamps);
}
