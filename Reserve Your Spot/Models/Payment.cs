namespace Reserve_Your_Spot.Models;

public class Payment
{
    public string Id { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "gbp";
    public string? StripePaymentIntentId { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public PaymentType Type { get; set; } = PaymentType.Deposit;
    public decimal PlatformFee { get; set; }
    public decimal BusinessAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum PaymentStatus { Pending, Succeeded, Refunded, Failed }
public enum PaymentType { Deposit, Full, Subscription }
