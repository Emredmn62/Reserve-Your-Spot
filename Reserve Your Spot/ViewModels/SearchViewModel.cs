using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

[QueryProperty(nameof(CategorySlug), "categorySlug")]
public partial class SearchViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;

    [ObservableProperty] private string _searchQuery = string.Empty;
    [ObservableProperty] private string? _categorySlug;
    [ObservableProperty] private Category? _selectedCategory;
    [ObservableProperty] private bool _isMapView;
    [ObservableProperty] private bool _hasResults;

    public List<Category> Categories { get; } = Category.Defaults;
    public ObservableCollection<Business> Results { get; } = new();

    public SearchViewModel(IBusinessService businessService)
    {
        _businessService = businessService;
        Title = "Search";
    }

    partial void OnCategorySlugChanged(string? value)
    {
        if (!string.IsNullOrEmpty(value))
            SelectedCategory = Categories.FirstOrDefault(c => c.Slug == value);
    }

    [RelayCommand]
    private async Task SearchAsync()
    {
        IsBusy = true;
        ClearError();
        try
        {
            var results = await _businessService.SearchBusinessesAsync(
                SearchQuery ?? "", SelectedCategory?.Slug);
            Results.Clear();
            foreach (var b in results) Results.Add(b);
            HasResults = Results.Count > 0;
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void Clear()
    {
        SearchQuery = string.Empty;
        SelectedCategory = null;
        Results.Clear();
        HasResults = false;
    }

    [RelayCommand]
    private void SelectCategory(Category category)
    {
        SelectedCategory = SelectedCategory?.Id == category.Id ? null : category;
        _ = SearchAsync();
    }

    [RelayCommand]
    private async Task NavigateToBusinessAsync(Business business)
    {
        if (business == null) return;
        await Shell.Current.GoToAsync($"{AppConstants.RouteBusinessProfile}?businessId={business.Id}");
    }

    [RelayCommand]
    private void ToggleMapView() => IsMapView = !IsMapView;
}
