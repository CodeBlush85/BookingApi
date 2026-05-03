const Room = require('../models/room');

function listRooms(req, res) {
  res.json(Room.getAll());
}

function getRoom(req, res) {
  const room = Room.getById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
}

function createRoom(req, res) {
  const { name, capacity, description } = req.body;
  const room = Room.create({ name, capacity, description: description || '' });
  res.status(201).json(room);
}

function updateRoom(req, res) {
  const { name, capacity, description } = req.body;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (capacity !== undefined) updates.capacity = capacity;
  if (description !== undefined) updates.description = description;
  const room = Room.update(req.params.id, updates);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
}

function deleteRoom(req, res) {
  const deleted = Room.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Room not found' });
  res.status(204).send();
}

module.exports = { listRooms, getRoom, createRoom, updateRoom, deleteRoom };
