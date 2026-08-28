using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public interface IAuthService
{
    Task<bool> SignUpAsync(string email, string password, string fullName, string phone, bool isBusinessOwner);
    Task<bool> SignInAsync(string email, string password);
    Task SignOutAsync();
    Task<User?> GetCurrentUserAsync();
    bool IsLoggedIn { get; }
    string? CurrentUserId { get; }
    bool IsBusinessOwner { get; }
}
