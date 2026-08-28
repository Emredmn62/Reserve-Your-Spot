using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels.BusinessPortal;

public partial class ManageStaffViewModel : BaseViewModel
{
    private readonly IBusinessService _businessService;
    private readonly IAuthService _authService;
    private string? _businessId;

    [ObservableProperty] private bool _isAddingStaff;
    [ObservableProperty] private Staff? _editingStaff;
    [ObservableProperty] private string _newStaffName = string.Empty;
    [ObservableProperty] private string _newStaffRole = string.Empty;
    [ObservableProperty] private string _newStaffPhotoUrl = string.Empty;
    [ObservableProperty] private string _newStaffBio = string.Empty;

    public ObservableCollection<Staff> StaffList { get; } = new();

    public ManageStaffViewModel(IBusinessService businessService, IAuthService authService)
    {
        _businessService = businessService;
        _authService = authService;
        Title = "Manage Staff";
    }

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var uid = _authService.CurrentUserId;
            if (uid == null) return;
            var biz = await _businessService.GetBusinessByOwnerAsync(uid);
            _businessId = biz?.Id;
            if (_businessId == null) return;
            var staff = await _businessService.GetStaffAsync(_businessId);
            StaffList.Clear();
            foreach (var s in staff) StaffList.Add(s);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private void ShowAddForm() { IsAddingStaff = true; EditingStaff = null; ClearForm(); }

    [RelayCommand]
    private void EditStaff(Staff staff)
    {
        EditingStaff = staff;
        NewStaffName = staff.Name;
        NewStaffRole = staff.Role;
        NewStaffPhotoUrl = staff.PhotoUrl ?? string.Empty;
        NewStaffBio = staff.Bio ?? string.Empty;
        IsAddingStaff = true;
    }

    [RelayCommand]
    private async Task SaveStaffAsync()
    {
        if (string.IsNullOrWhiteSpace(NewStaffName) || _businessId == null) return;
        IsBusy = true;
        try
        {
            if (EditingStaff != null)
            {
                EditingStaff.Name = NewStaffName;
                EditingStaff.Role = NewStaffRole;
                EditingStaff.PhotoUrl = NewStaffPhotoUrl;
                EditingStaff.Bio = NewStaffBio;
                await _businessService.UpdateStaffAsync(EditingStaff);
            }
            else
            {
                await _businessService.AddStaffAsync(new Staff
                {
                    BusinessId = _businessId,
                    Name = NewStaffName,
                    Role = NewStaffRole,
                    PhotoUrl = string.IsNullOrEmpty(NewStaffPhotoUrl) ? null : NewStaffPhotoUrl,
                    Bio = string.IsNullOrEmpty(NewStaffBio) ? null : NewStaffBio,
                    IsActive = true
                });
            }
            IsAddingStaff = false;
            await LoadAsync();
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task DeleteStaffAsync(Staff staff)
    {
        var confirm = await Shell.Current.DisplayAlert("Delete", $"Remove '{staff.Name}'?", "Remove", "Cancel");
        if (!confirm) return;
        await _businessService.DeleteStaffAsync(staff.Id);
        await LoadAsync();
    }

    [RelayCommand]
    private void Cancel() { IsAddingStaff = false; ClearForm(); }

    private void ClearForm()
    {
        NewStaffName = string.Empty;
        NewStaffRole = string.Empty;
        NewStaffPhotoUrl = string.Empty;
        NewStaffBio = string.Empty;
        EditingStaff = null;
    }
}
