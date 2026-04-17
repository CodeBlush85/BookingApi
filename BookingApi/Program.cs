using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<BookingStore>();

var app = builder.Build();

app.MapGet("/", () => "Booking API");

app.MapGet("/bookings", (BookingStore store) => Results.Ok(store.GetAll()));

app.MapGet("/bookings/{id:int}", (int id, BookingStore store) =>
{
    var booking = store.GetById(id);
    return booking is null ? Results.NotFound() : Results.Ok(booking);
});

app.MapPost("/bookings", (CreateBookingRequest request, BookingStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.GuestName))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [nameof(request.GuestName)] = ["Guest name is required."]
        });
    }

    if (request.CheckOutDate <= request.CheckInDate)
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            [nameof(request.CheckOutDate)] = ["Check-out date must be after check-in date."]
        });
    }

    var booking = store.Create(request);
    return Results.Created($"/bookings/{booking.Id}", booking);
});

app.Run();

public record CreateBookingRequest(string GuestName, int RoomNumber, DateOnly CheckInDate, DateOnly CheckOutDate);

public record Booking(int Id, string GuestName, int RoomNumber, DateOnly CheckInDate, DateOnly CheckOutDate);

public sealed class BookingStore
{
    private int _nextId;
    private readonly ConcurrentDictionary<int, Booking> _bookings = new();

    public IReadOnlyCollection<Booking> GetAll() => _bookings.Values.OrderBy(b => b.Id).ToArray();

    public Booking? GetById(int id) => _bookings.TryGetValue(id, out var booking) ? booking : null;

    public Booking Create(CreateBookingRequest request)
    {
        var id = Interlocked.Increment(ref _nextId);
        var booking = new Booking(id, request.GuestName.Trim(), request.RoomNumber, request.CheckInDate, request.CheckOutDate);
        _bookings[id] = booking;
        return booking;
    }
}

public partial class Program;
