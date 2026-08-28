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
    [ObservableProperty] private decimal _depositAmount;
    [ObservableProperty] private decimal _totalPrice;
    [ObservableProperty] private decimal _remainingBalance;
    [ObservableProperty] private string _cardNumber = string.Empty;
    [ObservableProperty] private string _expiryDate = string.Empty;
    [ObservableProperty] private string _cvv = string.Empty;
    [ObservableProperty] private string _cardHolderName = string.Empty;

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
            {
                TotalPrice = Service.Price;
                DepositAmount = Service.DepositAmount > 0 ? Service.DepositAmount
                    : Math.Round(Service.Price * (Business?.DepositPercentage ?? 20) / 100, 2);
                RemainingBalance = TotalPrice - DepositAmount;
            }
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

    [RelayCommand]
    private async Task PayDepositAsync()
    {
        if (Service == null || Business == null) return;
        IsBusy = true;
        ClearError();
        try
        {
            var uid = _authService.CurrentUserId;
            if (string.IsNullOrEmpty(uid)) { SetError("Not logged in."); return; }

            // Create booking first
            var booking = new Booking
            {
                CustomerId = uid,
                BusinessId = Business.Id,
                ServiceId = Service.Id,
                StaffId = StaffId,
                StartTime = SelectedDateTime,
                EndTime = SelectedDateTime.AddMinutes(Service.DurationMinutes),
                TotalPrice = TotalPrice,
                DepositAmount = DepositAmount,
                RemainingBalance = RemainingBalance,
                Status = BookingStatus.Pending
            };
            var created = await _bookingService.CreateBookingAsync(booking);
            if (created == null) { SetError("Failed to create booking."); return; }

            // Create payment intent (Stripe via Edge Function)
            var clientSecret = await _paymentService.CreatePaymentIntentAsync(
                DepositAmount, "gbp", created.Id, uid);

            // Record payment
            await _paymentService.RecordPaymentAsync(new Payment
            {
                BookingId = created.Id,
                CustomerId = uid,
                BusinessId = Business.Id,
                Amount = DepositAmount,
                Type = PaymentType.Deposit,
                PlatformFee = Math.Round(DepositAmount * AppConstants.PlatformFeePercent, 2),
                BusinessAmount = Math.Round(DepositAmount * (1 - AppConstants.PlatformFeePercent), 2),
                StripePaymentIntentId = clientSecret
            });

            await Shell.Current.GoToAsync(
                $"{AppConstants.RouteBookingConfirmation}?bookingId={created.Id}");
        }
        catch (Exception ex) { SetError(ex.Message); }
        finally { IsBusy = false; }
    }
}
