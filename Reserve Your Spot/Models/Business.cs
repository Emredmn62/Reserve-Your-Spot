namespace Reserve_Your_Spot.Models;

public class Business
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    public List<string> GalleryUrls { get; set; } = new();
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string? InstagramUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? WhatsAppNumber { get; set; }
    public Dictionary<string, string> OpeningHours { get; set; } = new();
    public string CancellationPolicy { get; set; } = string.Empty;
    public decimal DepositPercentage { get; set; } = 20;
    public bool IsApproved { get; set; }
    public bool IsFeatured { get; set; }
    public DateTime? BoostExpiresAt { get; set; }
    public string SubscriptionPlan { get; set; } = "free";
    public double Rating { get; set; }
    public int TotalReviews { get; set; }
    public double? DistanceKm { get; set; }
    public Category? Category { get; set; }
    public DateTime CreatedAt { get; set; }

    public string DistanceDisplay => DistanceKm.HasValue
        ? DistanceKm.Value < 1 ? $"{DistanceKm.Value * 1000:F0}m" : $"{DistanceKm.Value:F1}km"
        : string.Empty;

    public string RatingDisplay => Rating > 0 ? $"{Rating:F1}" : "New";
}
