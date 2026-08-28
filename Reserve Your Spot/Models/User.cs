namespace Reserve_Your_Spot.Models;

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public bool IsBusinessOwner { get; set; }
    public string? FcmToken { get; set; }
    public DateTime CreatedAt { get; set; }
}
