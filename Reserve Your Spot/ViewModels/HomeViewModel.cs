using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

public partial class HomeViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private readonly IPostService _postService;

    [ObservableProperty] private string _greetingText = "Hello 👋";
    [ObservableProperty] private string _userInitials = "U";
    [ObservableProperty] private Category? _selectedCategory;
    [ObservableProperty] private bool _hasPosts;

    public List<Category> Categories { get; } = Category.Defaults;

    /// <summary>The Home feed: newest posts from approved businesses, Instagram-style.</summary>
    public ObservableCollection<Post> FeedPosts { get; } = new();

    public HomeViewModel(IBusinessService businessService, IAuthService authService, IPostService postService)
    {
        _businessService = businessService;
        _authService = authService;
        _postService = postService;
        Title = AppConstants.AppName;
        SetGreeting();
    }

    private void SetGreeting()
    {
        var hour = DateTime.Now.Hour;
        var timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
        GreetingText = $"{timeGreeting} 👋";
    }

    [RelayCommand]
    private async Task LoadDataAsync()
    {
        if (IsBusy) return;
        IsBusy = true;
        ClearError();
        try
        {
            var user = await _authService.GetCurrentUserAsync();
            if (user != null)
            {
                var hour = DateTime.Now.Hour;
                var timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
                var firstName = user.FullName.Split(' ').FirstOrDefault() ?? "there";
                GreetingText = $"{timeGreeting}, {firstName} 👋";
                UserInitials = string.Join("", user.FullName.Split(' ').Take(2).Select(n => n.FirstOrDefault()));
            }

            var feed = await _postService.GetFeedAsync();
            FeedPosts.Clear();
            foreach (var post in feed) FeedPosts.Add(post);
            HasPosts = FeedPosts.Count > 0;
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task NavigateToBusinessAsync(Business business)
    {
        if (business == null) return;
        await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={business.Id}");
    }

    [RelayCommand]
    private async Task NavigateToPostBusinessAsync(Post post)
    {
        if (post?.Business == null) return;
        await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={post.Business.Id}");
    }

    [RelayCommand]
    private async Task SearchAsync()
        => await Shell.Current.GoToAsync(AppConstants.RouteSearch);

    [RelayCommand]
    private async Task FilterByCategoryAsync(Category category)
    {
        SelectedCategory = category;
        await Shell.Current.GoToAsync($"{AppConstants.RouteSearch}?categorySlug={category.Slug}");
    }
}
