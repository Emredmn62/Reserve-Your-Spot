using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public interface IReferralService
{
    /// <summary>True if the code exists and has not been redeemed yet.</summary>
    Task<bool> IsValidAsync(string code);

    /// <summary>
    /// Marks the code as used by the given business. Returns false if the code
    /// is missing or already redeemed (one business per code).
    /// </summary>
    Task<bool> RedeemAsync(string code, string businessId);
}
