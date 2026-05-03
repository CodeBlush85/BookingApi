const request = require('supertest');
const app = require('../src/app');
const RoomModel = require('../src/models/room');
const BookingModel = require('../src/models/booking');

describe('Bookings API', () => {
  let roomId;
  let bookingId;
  const baseStart = '2025-06-01T10:00:00.000Z';
  const baseEnd = '2025-06-01T11:00:00.000Z';

  beforeAll(async () => {
    // Create a dedicated room for booking tests
    const res = await request(app).post('/api/rooms').send({
      name: 'Booking Test Room',
      capacity: 6,
      description: 'For booking tests',
    });
    roomId = res.body.id;
  });

  describe('GET /api/bookings', () => {
    it('should return an array', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a booking', async () => {
      const res = await request(app).post('/api/bookings').send({
        roomId,
        title: 'Team Standup',
        startTime: baseStart,
        endTime: baseEnd,
        bookedBy: 'alice@example.com',
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ roomId, title: 'Team Standup', bookedBy: 'alice@example.com' });
      expect(res.body.id).toBeDefined();
      bookingId = res.body.id;
    });

    it('should return 400 if roomId is missing', async () => {
      const res = await request(app).post('/api/bookings').send({
        title: 'X',
        startTime: baseStart,
        endTime: baseEnd,
        bookedBy: 'bob@example.com',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app).post('/api/bookings').send({
        roomId,
        startTime: baseStart,
        endTime: baseEnd,
        bookedBy: 'bob@example.com',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 if startTime is invalid', async () => {
      const res = await request(app).post('/api/bookings').send({
        roomId,
        title: 'X',
        startTime: 'not-a-date',
        endTime: baseEnd,
        bookedBy: 'bob@example.com',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 if startTime >= endTime', async () => {
      const res = await request(app).post('/api/bookings').send({
        roomId,
        title: 'Bad Times',
        startTime: baseEnd,
        endTime: baseStart,
        bookedBy: 'bob@example.com',
      });
      expect(res.status).toBe(400);
    });

    it('should return 404 if room does not exist', async () => {
      const res = await request(app).post('/api/bookings').send({
        roomId: 'nonexistent-room',
        title: 'Ghost Booking',
        startTime: baseStart,
        endTime: baseEnd,
        bookedBy: 'bob@example.com',
      });
      expect(res.status).toBe(404);
    });

    it('should return 409 on booking conflict', async () => {
      // Exact same slot
      const res = await request(app).post('/api/bookings').send({
        roomId,
        title: 'Conflicting Booking',
        startTime: baseStart,
        endTime: baseEnd,
        bookedBy: 'carol@example.com',
      });
      expect(res.status).toBe(409);
    });

    it('should return 409 for overlapping booking', async () => {
      const res = await request(app).post('/api/bookings').send({
        roomId,
        title: 'Overlap Booking',
        startTime: '2025-06-01T10:30:00.000Z',
        endTime: '2025-06-01T11:30:00.000Z',
        bookedBy: 'dave@example.com',
      });
      expect(res.status).toBe(409);
    });

    it('should allow non-overlapping booking in the same room', async () => {
      const res = await request(app).post('/api/bookings').send({
        roomId,
        title: 'Later Meeting',
        startTime: '2025-06-01T12:00:00.000Z',
        endTime: '2025-06-01T13:00:00.000Z',
        bookedBy: 'eve@example.com',
      });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return a booking by ID', async () => {
      const res = await request(app).get(`/api/bookings/${bookingId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(bookingId);
    });

    it('should return 404 for unknown ID', async () => {
      const res = await request(app).get('/api/bookings/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/bookings with filters', () => {
    it('should filter by roomId', async () => {
      const res = await request(app).get(`/api/bookings?roomId=${roomId}`);
      expect(res.status).toBe(200);
      expect(res.body.every((b) => b.roomId === roomId)).toBe(true);
    });

    it('should filter by date', async () => {
      const res = await request(app).get('/api/bookings?date=2025-06-01');
      expect(res.status).toBe(200);
      expect(res.body.every((b) => b.startTime.startsWith('2025-06-01'))).toBe(true);
    });

    it('should return empty array for date with no bookings', async () => {
      const res = await request(app).get('/api/bookings?date=1999-01-01');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('PUT /api/bookings/:id', () => {
    it('should update a booking title', async () => {
      const res = await request(app).put(`/api/bookings/${bookingId}`).send({ title: 'Updated Standup' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Standup');
    });

    it('should return 404 for unknown ID', async () => {
      const res = await request(app).put('/api/bookings/nonexistent-id').send({ title: 'X' });
      expect(res.status).toBe(404);
    });

    it('should return 409 when update causes a conflict', async () => {
      // bookingId occupies baseStart-baseEnd; try to move it to overlap with the later meeting
      const res = await request(app).put(`/api/bookings/${bookingId}`).send({
        startTime: '2025-06-01T12:30:00.000Z',
        endTime: '2025-06-01T13:30:00.000Z',
      });
      expect(res.status).toBe(409);
    });

    it('should return 400 if updated times are invalid', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}`)
        .send({ startTime: '2025-06-01T11:00:00.000Z', endTime: '2025-06-01T10:00:00.000Z' });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should delete a booking', async () => {
      const res = await request(app).delete(`/api/bookings/${bookingId}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app).get(`/api/bookings/${bookingId}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 for unknown ID', async () => {
      const res = await request(app).delete('/api/bookings/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('Health check', () => {
    it('GET /health should return ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });
});
