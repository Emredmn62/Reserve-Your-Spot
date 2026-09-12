using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public interface IPostService
{
    /// <summary>Newest-first, approved businesses only. This is the Home feed.</summary>
    Task<List<Post>> GetFeedAsync();

    Task<List<Post>> GetPostsForBusinessAsync(string businessId);

    Task<Post?> CreatePostAsync(Post post);

    Task DeletePostAsync(string postId);
}
