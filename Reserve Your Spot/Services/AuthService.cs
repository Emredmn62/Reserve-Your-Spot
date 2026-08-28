using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public class AuthService : IAuthService
{
    private readonly SupabaseService _supabase;
    private User? _currentUser;

    private const string TokenKey = "auth_token";
    private const string UserIdKey = "user_id";
    private const string IsOwnerKey = "is_owner";

    public bool IsLoggedIn => !string.IsNullOrEmpty(_supabase.AccessToken);
    public string? CurrentUserId { get; private set; }
    public bool IsBusinessOwner { get; private set; }

    public AuthService(SupabaseService supabase)
    {
        _supabase = supabase;
        // Restore token on startup
        try
        {
            var token = SecureStorage.GetAsync(TokenKey).GetAwaiter().GetResult();
            var uid = SecureStorage.GetAsync(UserIdKey).GetAwaiter().GetResult();
            var isOwner = SecureStorage.GetAsync(IsOwnerKey).GetAwaiter().GetResult();
            if (!string.IsNullOrEmpty(token))
            {
                _supabase.AccessToken = token;
                CurrentUserId = uid;
                IsBusinessOwner = isOwner == "true";
            }
        }
        catch { /* SecureStorage may not be available on all platforms at startup */ }
    }

    public async Task<bool> SignUpAsync(string email, string password, string fullName, string phone, bool isBusinessOwner)
    {
        try
        {
            var metadata = new Dictionary<string, object>
            {
                ["full_name"] = fullName,
                ["phone_number"] = phone,
                ["is_business_owner"] = isBusinessOwner
            };
            var token = await _supabase.SignUpAsync(email, password, metadata);
            if (string.IsNullOrEmpty(token)) return false;

            _supabase.AccessToken = token;
            await SecureStorage.SetAsync(TokenKey, token);
            IsBusinessOwner = isBusinessOwner;
            await SecureStorage.SetAsync(IsOwnerKey, isBusinessOwner ? "true" : "false");
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> SignInAsync(string email, string password)
    {
        try
        {
            var (token, userId) = await _supabase.SignInAsync(email, password);
            if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(userId)) return false;

            _supabase.AccessToken = token;
            CurrentUserId = userId;
            await SecureStorage.SetAsync(TokenKey, token);
            await SecureStorage.SetAsync(UserIdKey, userId);

            var user = await GetCurrentUserAsync();
            IsBusinessOwner = user?.IsBusinessOwner ?? false;
            await SecureStorage.SetAsync(IsOwnerKey, IsBusinessOwner ? "true" : "false");
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task SignOutAsync()
    {
        _supabase.AccessToken = null;
        CurrentUserId = null;
        IsBusinessOwner = false;
        _currentUser = null;
        try
        {
            SecureStorage.Remove(TokenKey);
            SecureStorage.Remove(UserIdKey);
            SecureStorage.Remove(IsOwnerKey);
        }
        catch { /* ignore */ }
        await Task.CompletedTask;
    }

    public async Task<User?> GetCurrentUserAsync()
    {
        if (_currentUser != null) return _currentUser;
        if (string.IsNullOrEmpty(CurrentUserId)) return null;
        try
        {
            _currentUser = await _supabase.GetSingleAsync<User>("users", $"id=eq.{CurrentUserId}");
            return _currentUser;
        }
        catch
        {
            return null;
        }
    }
}
