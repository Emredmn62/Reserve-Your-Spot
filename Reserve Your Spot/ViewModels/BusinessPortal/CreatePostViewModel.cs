using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

public partial class CreatePostViewModel : BaseViewModel
{
    private readonly IPostService _postService;
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;

    [ObservableProperty] private string? _imagePath;
    [ObservableProperty] private string _caption = string.Empty;
    [ObservableProperty] private bool _canPost;

    public CreatePostViewModel(IPostService postService, IBusinessService businessService, IAuthService authService)
    {
        _postService = postService;
        _businessService = businessService;
        _authService = authService;
        Title = "New Post";
    }

    partial void OnImagePathChanged(string? value) => UpdateCanPost();
    partial void OnCaptionChanged(string value) => UpdateCanPost();

    private void UpdateCanPost() => CanPost = !string.IsNullOrEmpty(ImagePath);

    [RelayCommand]
    private async Task PickPhotoAsync()
    {
        try
        {
            var photo = await MediaPicker.Default.PickPhotoAsync();
            if (photo == null) return;

            // Copy into app-local storage so the path is stable for the app's lifetime.
            var localPath = Path.Combine(FileSystem.CacheDirectory, $"post_{Guid.NewGuid():N}{Path.GetExtension(photo.FileName)}");
            await using (var source = await photo.OpenReadAsync())
            await using (var dest = File.Create(localPath))
                await source.CopyToAsync(dest);

            ImagePath = localPath;
        }
        catch (Exception ex)
        {
            SetError($"Couldn't open photo picker: {ex.Message}");
        }
    }

    [RelayCommand]
    private async Task PostAsync()
    {
        if (string.IsNullOrEmpty(ImagePath)) return;
        var uid = _authService.CurrentUserId;
        if (uid == null) { SetError("Not logged in."); return; }

        IsBusy = true;
        ClearError();
        try
        {
            var business = await _businessService.GetBusinessByOwnerAsync(uid);
            if (business == null) { SetError("Create your business profile first."); return; }

            await _postService.CreatePostAsync(new Post
            {
                BusinessId = business.Id,
                ImageUrl = ImagePath,
                Caption = Caption.Trim()
            });

            var message = business.IsApproved
                ? "Your post is live in the customer feed."
                : "Post saved. It'll appear in the customer feed as soon as your listing is approved and live.";
            await Shell.Current.DisplayAlert("Posted", message, "OK");
            await Shell.Current.GoToAsync("..");
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }
}
