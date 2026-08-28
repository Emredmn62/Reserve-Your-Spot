namespace Reserve_Your_Spot.Models;

public class Booking
{
    public string Id { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public string ServiceId { get; set; } = string.Empty;
    public string? StaffId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public decimal TotalPrice { get; set; }
    public decimal DepositAmount { get; set; }
    public bool DepositPaid { get; set; }
    public decimal RemainingBalance { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public bool IsManual { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public Business? Business { get; set; }
    public Service? Service { get; set; }
    public Staff? Staff { get; set; }
    public User? Customer { get; set; }

    public string StatusColor => Status switch
    {
        BookingStatus.Confirmed  => "#44BB44",
        BookingStatus.Pending    => "#C9A84C",
        BookingStatus.Cancelled  => "#FF4444",
        BookingStatus.Completed  => "#888888",
        BookingStatus.NoShow     => "#FF6600",
        _                        => "#888888"
    };

    public string StatusLabel => Status.ToString();

    public string TimeDisplay => StartTime.ToString("HH:mm");
    public string DateDisplay  => StartTime.ToString("ddd dd MMM");
}

public enum BookingStatus { Pending, Confirmed, Completed, Cancelled, NoShow }
