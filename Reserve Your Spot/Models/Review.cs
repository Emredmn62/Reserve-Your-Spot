namespace Reserve_Your_Spot.Models;

public class Review
{
    public string Id { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty;
    public string BusinessId { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public User? Customer { get; set; }

    public string DateDisplay => CreatedAt.ToString("dd MMM yyyy");
    public string CustomerName => Customer?.FullName ?? "Anonymous";
}
