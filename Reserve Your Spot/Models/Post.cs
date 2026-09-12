namespace Reserve_Your_Spot.Models;

/// <summary>
/// A single feed post from a business — one photo + a caption. This is the
/// primary thing customers scroll through on Home, like a business's Instagram.
/// </summary>
public class Post
{
    public string Id { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public string Caption { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Business? Business { get; set; }

    public string TimeAgoDisplay
    {
        get
        {
            var span = DateTime.Now - CreatedAt;
            if (span.TotalMinutes < 1) return "just now";
            if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes}m ago";
            if (span.TotalHours < 24) return $"{(int)span.TotalHours}h ago";
            if (span.TotalDays < 7) return $"{(int)span.TotalDays}d ago";
            return CreatedAt.ToString("d MMM");
        }
    }
}
