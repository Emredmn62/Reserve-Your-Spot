using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

[QueryProperty(nameof(BookingId), "bookingId")]
public partial class BookingConfirmationViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;

    [ObservableProperty] private string? _bookingId;
    [ObservableProperty] private Booking? _booking;
    [ObservableProperty] private string _confirmationMessage = "Your booking is confirmed!";

    public BookingConfirmationViewModel(IBookingService bookingService, IBusinessService businessService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        Title = "Booking Confirmed";
    }

    partial void OnBookingIdChanged(string? value)
    {
        if (!string.IsNullOrEmpty(value)) _ = LoadAsync();
    }

    private async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            var bookings = await _bookingService.GetCustomerBookingsAsync(BookingId!);
            Booking = bookings.FirstOrDefault(b => b.Id == BookingId);
            if (Booking?.BusinessId != null)
                Booking.Business = await _businessService.GetBusinessByIdAsync(Booking.BusinessId);
        }
        finally { IsBusy = false; }
    }

    [RelayCommand]
    private async Task BackToHomeAsync()
        => await Shell.Current.GoToAsync(AppConstants.RouteHome);

    [RelayCommand]
    private async Task AddToCalendarAsync()
    {
        if (Booking == null) return;
        // Platform calendar integration would go here
        await Shell.Current.DisplayAlert("Calendar",
            "Calendar integration coming soon!", "OK");
    }

    [RelayCommand]
    private async Task ShareAsync()
    {
        if (Booking?.Business == null) return;
        await Microsoft.Maui.ApplicationModel.DataTransfer.Share.Default.RequestAsync(
            new ShareTextRequest
            {
                Title = "My Booking",
                Text = $"I booked {Booking.Business.Name} on {AppConstants.AppName} — {Booking.DateDisplay} at {Booking.TimeDisplay}"
            });
    }
}
