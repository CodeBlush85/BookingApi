# BookingApi

A RESTful Booking API built with Node.js and Express. Manage rooms and bookings with in-memory storage, validation, and conflict detection.

## Setup

```bash
npm install
npm start        # production
npm run dev      # development with hot-reload (nodemon)
npm test         # run tests
```

## API Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `{ status: 'ok' }` |

### Rooms `/api/rooms`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/:id` | Get room by ID |
| POST | `/api/rooms` | Create a room |
| PUT | `/api/rooms/:id` | Update a room |
| DELETE | `/api/rooms/:id` | Delete a room |

**POST /api/rooms body:**
```json
{ "name": "Conference Room A", "capacity": 10, "description": "Optional description" }
```

### Bookings `/api/bookings`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/bookings` | List all bookings (supports `?roomId=` and `?date=YYYY-MM-DD`) |
| GET | `/api/bookings/:id` | Get booking by ID |
| POST | `/api/bookings` | Create a booking |
| PUT | `/api/bookings/:id` | Update a booking |
| DELETE | `/api/bookings/:id` | Cancel a booking |

**POST /api/bookings body:**
```json
{
  "roomId": "uuid-of-room",
  "title": "Team Standup",
  "startTime": "2025-06-01T10:00:00.000Z",
  "endTime": "2025-06-01T11:00:00.000Z",
  "bookedBy": "alice@example.com"
}
```

## Response Codes
- `200` OK, `201` Created, `204` No Content
- `400` Validation error (invalid fields or startTime >= endTime)
- `404` Resource not found
- `409` Booking conflict (overlapping times for same room)
