namespace Reserve_Your_Spot.Services;

public class ReferralService : IReferralService
{
    private readonly SupabaseService _supabase;

    public ReferralService(SupabaseService supabase)
    {
        _supabase = supabase;
    }

    public async Task<bool> IsValidAsync(string code)
    {
        if (string.IsNullOrWhiteSpace(code)) return false;
        try
        {
            var row = await _supabase.GetSingleAsync<ReferralCodeRow>(
                "referral_codes", $"code=eq.{Uri.EscapeDataString(code.Trim())}&used_by_business_id=is.null");
            return row != null;
        }
        catch { return false; }
    }

    public async Task<bool> RedeemAsync(string code, string businessId)
    {
        if (string.IsNullOrWhiteSpace(code)) return false;
        try
        {
            // Only claims the row if it's still unused - two people redeeming
            // the same code at once can't both win.
            await _supabase.UpdateAsync(
                "referral_codes",
                $"code=eq.{Uri.EscapeDataString(code.Trim())}&used_by_business_id=is.null",
                new { used_by_business_id = businessId, used_at = DateTime.UtcNow });

            var row = await _supabase.GetSingleAsync<ReferralCodeRow>(
                "referral_codes", $"code=eq.{Uri.EscapeDataString(code.Trim())}");
            return row?.UsedByBusinessId == businessId;
        }
        catch { return false; }
    }

    private class ReferralCodeRow
    {
        public string? UsedByBusinessId { get; set; }
    }
}
