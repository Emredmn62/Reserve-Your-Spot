using Reserve_Your_Spot.Views.Auth;
using Reserve_Your_Spot.Views.BusinessPortal;
using Reserve_Your_Spot.Views.Customer;

namespace Reserve_Your_Spot
{
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();
            RegisterRoutes();
        }

        private static void RegisterRoutes()
        {
            Routing.RegisterRoute("login", typeof(LoginPage));
            Routing.RegisterRoute("register", typeof(RegisterPage));
            Routing.RegisterRoute("businessregister", typeof(BusinessRegisterPage));

            Routing.RegisterRoute("businessprofile", typeof(BusinessProfilePage));
            Routing.RegisterRoute("serviceselection", typeof(ServiceSelectionPage));
            Routing.RegisterRoute("staffselection", typeof(StaffSelectionPage));
            Routing.RegisterRoute("datetimeselection", typeof(DateTimeSelectionPage));
            Routing.RegisterRoute("payment", typeof(PaymentPage));
            Routing.RegisterRoute("bookingconfirmation", typeof(BookingConfirmationPage));
            Routing.RegisterRoute("createpost", typeof(CreatePostPage));
        }
    }
}
