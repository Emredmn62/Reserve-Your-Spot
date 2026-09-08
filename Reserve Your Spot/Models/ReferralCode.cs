namespace Reserve_Your_Spot.Models;

/// <summary>
/// An invite code. One code can be redeemed by exactly one business.
/// You (the operator) hand these out; a business must enter a valid, unused
/// code to create a listing.
/// </summary>
public class ReferralCode
{
    public string Code { get; set; } = string.Empty;
    public string? IssuedTo { get; set; }          // who you gave it to (name/note)
    public string? UsedByBusinessId { get; set; }  // null until redeemed
    public DateTime CreatedAt { get; set; }
    public DateTime? UsedAt { get; set; }

    public bool IsAvailable => string.IsNullOrEmpty(UsedByBusinessId);
}
