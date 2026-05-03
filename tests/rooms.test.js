const request = require('supertest');
const app = require('../src/app');
const RoomModel = require('../src/models/room');

describe('Rooms API', () => {
  let createdRoomId;

  describe('GET /api/rooms', () => {
    it('should return all rooms (pre-seeded)', async () => {
      const res = await request(app).get('/api/rooms');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/rooms', () => {
    it('should create a new room', async () => {
      const res = await request(app).post('/api/rooms').send({
        name: 'Test Room',
        capacity: 5,
        description: 'A test room',
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Test Room', capacity: 5, description: 'A test room' });
      expect(res.body.id).toBeDefined();
      createdRoomId = res.body.id;
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app).post('/api/rooms').send({ capacity: 5 });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 if capacity is missing', async () => {
      const res = await request(app).post('/api/rooms').send({ name: 'No Capacity' });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 if capacity is not a positive integer', async () => {
      const res = await request(app).post('/api/rooms').send({ name: 'Bad Cap', capacity: -1 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/rooms/:id', () => {
    it('should return a room by ID', async () => {
      const res = await request(app).get(`/api/rooms/${createdRoomId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdRoomId);
    });

    it('should return 404 for unknown ID', async () => {
      const res = await request(app).get('/api/rooms/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/rooms/:id', () => {
    it('should update a room', async () => {
      const res = await request(app).put(`/api/rooms/${createdRoomId}`).send({ name: 'Updated Room', capacity: 8 });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Room');
      expect(res.body.capacity).toBe(8);
    });

    it('should return 404 for unknown ID', async () => {
      const res = await request(app).put('/api/rooms/nonexistent-id').send({ name: 'X' });
      expect(res.status).toBe(404);
    });

    it('should return 400 if capacity is invalid', async () => {
      const res = await request(app).put(`/api/rooms/${createdRoomId}`).send({ capacity: 0 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/rooms/:id', () => {
    it('should delete a room', async () => {
      const res = await request(app).delete(`/api/rooms/${createdRoomId}`);
      expect(res.status).toBe(204);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app).get(`/api/rooms/${createdRoomId}`);
      expect(res.status).toBe(404);
    });

    it('should return 404 for unknown ID', async () => {
      const res = await request(app).delete('/api/rooms/nonexistent-id');
      expect(res.status).toBe(404);
    });
  });
});
