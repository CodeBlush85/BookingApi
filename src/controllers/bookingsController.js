const Booking = require('../models/booking');
const Room = require('../models/room');

function listBookings(req, res) {
  const { roomId, date } = req.query;
  res.json(Booking.getAll({ roomId, date }));
}

function getBooking(req, res) {
  const booking = Booking.getById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json(booking);
}

function createBooking(req, res) {
  const { roomId, title, startTime, endTime, bookedBy } = req.body;

  if (!Room.getById(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (new Date(startTime) >= new Date(endTime)) {
    return res.status(400).json({ error: 'startTime must be before endTime' });
  }

  if (Booking.hasConflict(roomId, startTime, endTime)) {
    return res.status(409).json({ error: 'Booking conflict: room is already booked for this time slot' });
  }

  const booking = Booking.create({ roomId, title, startTime, endTime, bookedBy });
  res.status(201).json(booking);
}

function updateBooking(req, res) {
  const existing = Booking.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Booking not found' });

  const { roomId, title, startTime, endTime, bookedBy } = req.body;
  const updates = {};
  if (roomId !== undefined) updates.roomId = roomId;
  if (title !== undefined) updates.title = title;
  if (startTime !== undefined) updates.startTime = startTime;
  if (endTime !== undefined) updates.endTime = endTime;
  if (bookedBy !== undefined) updates.bookedBy = bookedBy;

  const mergedRoomId = updates.roomId || existing.roomId;
  const mergedStart = updates.startTime || existing.startTime;
  const mergedEnd = updates.endTime || existing.endTime;

  if (updates.roomId && !Room.getById(updates.roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (new Date(mergedStart) >= new Date(mergedEnd)) {
    return res.status(400).json({ error: 'startTime must be before endTime' });
  }

  if (Booking.hasConflict(mergedRoomId, mergedStart, mergedEnd, req.params.id)) {
    return res.status(409).json({ error: 'Booking conflict: room is already booked for this time slot' });
  }

  const booking = Booking.update(req.params.id, updates);
  res.json(booking);
}

function deleteBooking(req, res) {
  const deleted = Booking.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Booking not found' });
  res.status(204).send();
}

module.exports = { listBookings, getBooking, createBooking, updateBooking, deleteBooking };
