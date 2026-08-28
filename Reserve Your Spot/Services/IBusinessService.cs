using Reserve_Your_Spot.Models;

namespace Reserve_Your_Spot.Services;

public interface IBusinessService
{
    Task<List<Business>> GetNearbyBusinessesAsync(double lat, double lng, double radiusKm = 10);
    Task<List<Business>> GetFeaturedBusinessesAsync();
    Task<List<Business>> SearchBusinessesAsync(string query, string? categorySlug = null);
    Task<Business?> GetBusinessByIdAsync(string id);
    Task<Business?> GetBusinessByOwnerAsync(string ownerId);
    Task<List<Service>> GetServicesAsync(string businessId);
    Task<List<Staff>> GetStaffAsync(string businessId);
    Task<List<Review>> GetReviewsAsync(string businessId);
    Task<bool> ToggleFavouriteAsync(string customerId, string businessId);
    Task<bool> IsFavouriteAsync(string customerId, string businessId);
    Task<List<Business>> GetFavouritesAsync(string customerId);
    Task<Business?> CreateBusinessAsync(Business business);
    Task UpdateBusinessAsync(Business business);
    Task<Service?> AddServiceAsync(Service service);
    Task UpdateServiceAsync(Service service);
    Task DeleteServiceAsync(string serviceId);
    Task<Staff?> AddStaffAsync(Staff staff);
    Task UpdateStaffAsync(Staff staff);
    Task DeleteStaffAsync(string staffId);
}
