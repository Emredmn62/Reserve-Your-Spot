namespace Reserve_Your_Spot.Controls;

public partial class GoldButton : ContentView
{
    public static readonly BindableProperty TextProperty =
        BindableProperty.Create(nameof(Text), typeof(string), typeof(GoldButton), string.Empty,
            propertyChanged: (b, o, n) => ((GoldButton)b).Btn.Text = (string)n);

    public static readonly BindableProperty CommandProperty =
        BindableProperty.Create(nameof(Command), typeof(System.Windows.Input.ICommand), typeof(GoldButton), null,
            propertyChanged: (b, o, n) => ((GoldButton)b).Btn.Command = (System.Windows.Input.ICommand)n);

    public static readonly BindableProperty CommandParameterProperty =
        BindableProperty.Create(nameof(CommandParameter), typeof(object), typeof(GoldButton), null,
            propertyChanged: (b, o, n) => ((GoldButton)b).Btn.CommandParameter = n);

    public static readonly BindableProperty IsEnabledButtonProperty =
        BindableProperty.Create(nameof(IsEnabledButton), typeof(bool), typeof(GoldButton), true,
            propertyChanged: (b, o, n) =>
            {
                var btn = ((GoldButton)b).Btn;
                btn.IsEnabled = (bool)n;
                btn.BackgroundColor = (bool)n
                    ? Color.FromArgb("#C9A84C")
                    : Color.FromArgb("#555555");
            });

    public string Text
    {
        get => (string)GetValue(TextProperty);
        set => SetValue(TextProperty, value);
    }

    public System.Windows.Input.ICommand? Command
    {
        get => (System.Windows.Input.ICommand?)GetValue(CommandProperty);
        set => SetValue(CommandProperty, value);
    }

    public object? CommandParameter
    {
        get => GetValue(CommandParameterProperty);
        set => SetValue(CommandParameterProperty, value);
    }

    public bool IsEnabledButton
    {
        get => (bool)GetValue(IsEnabledButtonProperty);
        set => SetValue(IsEnabledButtonProperty, value);
    }

    public event EventHandler? Clicked;

    public GoldButton()
    {
        InitializeComponent();
    }

    private void OnClicked(object sender, EventArgs e)
        => Clicked?.Invoke(this, e);
}
