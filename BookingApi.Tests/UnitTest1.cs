using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Mvc;

namespace BookingApi.Tests;

public class BookingApiTests
{
    [Fact]
    public async Task GetBookings_ReturnsEmptyCollectionInitially()
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/bookings");

        response.EnsureSuccessStatusCode();
        var bookings = await response.Content.ReadFromJsonAsync<List<Booking>>();

        Assert.NotNull(bookings);
        Assert.Empty(bookings);
    }

    [Fact]
    public async Task PostBooking_CreatesBookingAndCanBeRetrieved()
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var createRequest = new CreateBookingRequest("Ada Lovelace", 101, new DateOnly(2026, 5, 1), new DateOnly(2026, 5, 4));

        var createResponse = await client.PostAsJsonAsync("/bookings", createRequest);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createdBooking = await createResponse.Content.ReadFromJsonAsync<Booking>();
        Assert.NotNull(createdBooking);
        Assert.Equal("Ada Lovelace", createdBooking.GuestName);

        var getResponse = await client.GetAsync($"/bookings/{createdBooking.Id}");

        getResponse.EnsureSuccessStatusCode();
        var retrievedBooking = await getResponse.Content.ReadFromJsonAsync<Booking>();

        Assert.Equal(createdBooking, retrievedBooking);
    }

    [Fact]
    public async Task PostBooking_WithInvalidDates_ReturnsValidationProblem()
    {
        await using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var createRequest = new CreateBookingRequest("Grace Hopper", 202, new DateOnly(2026, 6, 10), new DateOnly(2026, 6, 10));

        var response = await client.PostAsJsonAsync("/bookings", createRequest);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDetails>();

        Assert.NotNull(problem);
        Assert.Contains(nameof(CreateBookingRequest.CheckOutDate), problem.Errors.Keys);
    }
}
