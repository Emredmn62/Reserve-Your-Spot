using CommunityToolkit.Mvvm.ComponentModel;

namespace Reserve_Your_Spot.ViewModels;

public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty] private bool _isBusy;
    [ObservableProperty] private string _title = string.Empty;
    [ObservableProperty] private string? _errorMessage;
    [ObservableProperty] private bool _hasError;

    protected void SetError(string message)
    {
        ErrorMessage = message;
        HasError = true;
    }

    protected void ClearError()
    {
        ErrorMessage = null;
        HasError = false;
    }
}
