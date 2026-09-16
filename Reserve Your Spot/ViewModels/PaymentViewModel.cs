using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Reserve_Your_Spot.Constants;
using Reserve_Your_Spot.Models;
using Reserve_Your_Spot.Services;

namespace Reserve_Your_Spot.ViewModels;

[QueryProperty(nameof(BusinessId), "businessId")]
[QueryProperty(nameof(ServiceId), "serviceId")]
[QueryProperty(nameof(StaffId), "staffId")]
[QueryProperty(nameof(DateTimeStr), "dateTime")]
public partial class PaymentViewModel : BaseViewModel
{
    private readonly IBookingService _bookingService;
    private readonly IBusinessService _businessService;
    private readonly IPaymentService _paymentService;
    private readonly IAuthService _authService;

    [ObservableProperty] private string? _businessId;
    [ObservableProperty] private string? _serviceId;
    [ObservableProperty] private string? _staffId;
    [ObservableProperty] private string? _dateTimeStr;
    [ObservableProperty] private Business? _business;
    [ObservableProperty] private Service? _service;
    [ObservableProperty] private Staff? _selectedStaff;
    [ObservableProperty] private DateTime _selectedDateTime;
    [ObservableProperty] private decimal _totalPrice;

    // Shown while we've sent the customer to Stripe Checkout and are waiting
    // for the webhook to confirm the payment actually went through.
    [ObservableProperty] private bool _isWaitingForPayment;
    [ObservableProperty] private string _waitingMessage = string.Empty;

    public PaymentViewModel(IBookingService bookingService, IBusinessService businessService,
        IPaymentService paymentService, IAuthService authService)
    {
        _bookingService = bookingService;
        _businessService = businessService;
        _paymentService = paymentService;
        _authService = authService;
        Title = "Confirm & Pay";
    }

    partial void OnBusinessIdChanged(string? v) { if (AllParamsReady) _ = LoadAsync(); }
    partial void OnServiceIdChanged(string? v)  { if (AllParamsReady) _ = LoadAsync(); }
    partial void OnDateTimeStrChanged(string? v) { if (AllParamsReady) _ = LoadAsync(); }

    private bool AllParamsReady => BusinessId != null && ServiceId != null && DateTimeStr != null;

    [RelayCommand]
    private async Task LoadAsync()
    {
        IsBusy = true;
        try
        {
            Business = await _businessService.GetBusinessByIdAsync(BusinessId!);
            var services = await _businessService.GetServicesAsync(BusinessId!);
            Service = services.FirstOrDefault(s => s.Id == ServiceId);
            if (Service != null)
                TotalPrice = Service.Price;

            if (!string.IsNullOrEmpty(StaffId))
            {
                var staffList = await _businessService.GetStaffAsync(BusinessId!);
                SelectedStaff = staffList.FirstOrDefault(s => s.Id == StaffId);
            }
            if (!string.IsNullOrEmpty(DateTimeStr) &&
                DateTime.TryParse(Uri.UnescapeDataString(DateTimeStr), out var dt))
                SelectedDateTime = dt;
        }
        finally { IsBusy = false; }
    }

    /// <summary>
    /// Creates the booking, then either: (mock) it's already paid, go straight
    /// to confirmation - or (real) opens Stripe Checkout and waits for the
    /// webhook to confirm the payment before moving on.
    /// </summary>
    [RelayCommand]
    private async Task PayNowAsync()
    {
        if (Service == null || Business == null) return;
        IsBusy = true;
        ClearError();
        try
        {
            var uid = _authService.CurrentUserId;
            if (string.IsNullOrEmpty(uid)) { SetError("Not logged in."); return; }

            var booking = new Booking
            {
                CustomerId = uid,
                BusinessId = Business.Id,
                ServiceId = Service.Id,
                StaffId = StaffId,
                StartTime = SelectedDateTime,
                EndTime = SelectedDateTime.AddMinutes(Service.DurationMinutes),
                TotalPrice = TotalPrice,
                DepositAmount = TotalPrice,  // paid in full, in-app
                RemainingBalance = 0,
                Status = BookingStatus.Pending
            };
            var created = await _bookingService.CreateBookingAsync(booking);
            if (created == null) { SetError("Failed to create booking. Please try again."); return; }

            var checkoutUrl = await _paymentService.CreateBookingCheckoutAsync(created);

            if (string.IsNullOrEmpty(checkoutUrl))
            {
                // No backend configured yet (mock) - the payment "already happened".
                await Shell.Current.GoToAsync($"{AppConstants.RouteBookingConfirmation}?bookingId={created.Id}");
                return;
            }

            IsWaitingForPayment = true;
            WaitingMessage = "Complete your payment in the browser, then come back here.";
            await Launcher.Default.OpenAsync(checkoutUrl);
            await WaitForPaymentAsync(created.Id);
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; IsWaitingForPayment = false; }
    }

    private async Task WaitForPaymentAsync(string bookingId)
    {
        const int pollSeconds = 3;
        const int maxAttempts = 100; // ~5 minutes

        for (var attempt = 0; attempt < maxAttempts; attempt++)
        {
            await Task.Delay(TimeSpan.FromSeconds(pollSeconds));

            var booking = await _bookingService.GetBookingByIdAsync(bookingId);
            if (booking == null) continue;

            if (booking.Status == BookingStatus.Confirmed)
            {
                await Shell.Current.GoToAsync($"{AppConstants.RouteBookingConfirmation}?bookingId={bookingId}");
                return;
            }
            if (booking.Status == BookingStatus.Cancelled)
            {
                SetError("That payment didn't go through. You can try again.");
                return;
            }

            WaitingMessage = $"Still waiting for payment to confirm... ({attempt * pollSeconds}s)";
        }

        SetError("Still waiting for confirmation - check My Bookings in a minute; your payment may have gone through.");
    }
}
