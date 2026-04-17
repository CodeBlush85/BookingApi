# BookingApi

Minimal ASP.NET Core Booking API.

## Endpoints

- `GET /` health/info endpoint
- `GET /bookings` list all bookings
- `GET /bookings/{id}` get a booking by id
- `POST /bookings` create a booking

### Create booking payload

```json
{
  "guestName": "Ada Lovelace",
  "roomNumber": 101,
  "checkInDate": "2026-05-01",
  "checkOutDate": "2026-05-04"
}
```
