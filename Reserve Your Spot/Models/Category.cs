namespace Reserve_Your_Spot.Models;

public class Category
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? IconEmoji { get; set; }
    public int SortOrder { get; set; }

    public static List<Category> Defaults => new()
    {
        new() { Id = "1",  Name = "Barbers",          Slug = "barbers",   IconEmoji = "✂️",  SortOrder = 1  },
        new() { Id = "2",  Name = "Hair Salons",       Slug = "hair",      IconEmoji = "💇",  SortOrder = 2  },
        new() { Id = "3",  Name = "Nail Shops",        Slug = "nails",     IconEmoji = "💅",  SortOrder = 3  },
        new() { Id = "4",  Name = "Beauty",            Slug = "beauty",    IconEmoji = "✨",  SortOrder = 4  },
        new() { Id = "5",  Name = "Lash Tech",         Slug = "lash",      IconEmoji = "👁️", SortOrder = 5  },
        new() { Id = "6",  Name = "Personal Training", Slug = "pt",        IconEmoji = "💪",  SortOrder = 6  },
        new() { Id = "7",  Name = "Tutors",            Slug = "tutors",    IconEmoji = "📚",  SortOrder = 7  },
        new() { Id = "8",  Name = "Massage",           Slug = "massage",   IconEmoji = "🧖",  SortOrder = 8  },
        new() { Id = "9",  Name = "Car Wash",          Slug = "carwash",   IconEmoji = "🚗",  SortOrder = 9  },
        new() { Id = "10", Name = "Cleaning",          Slug = "cleaning",  IconEmoji = "🧹",  SortOrder = 10 },
        new() { Id = "11", Name = "Mechanics",         Slug = "mechanics", IconEmoji = "🔧",  SortOrder = 11 },
    };
}
