const { v4: uuidv4 } = require('uuid');

const bookings = [];

function getAll({ roomId, date } = {}) {
  let result = [...bookings];
  if (roomId) {
    result = result.filter((b) => b.roomId === roomId);
  }
  if (date) {
    result = result.filter((b) => b.startTime.startsWith(date));
  }
  return result;
}

function getById(id) {
  return bookings.find((b) => b.id === id) || null;
}

function create(data) {
  const booking = { id: uuidv4(), ...data };
  bookings.push(booking);
  return booking;
}

function update(id, data) {
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;
  bookings[index] = { ...bookings[index], ...data };
  return bookings[index];
}

function remove(id) {
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return false;
  bookings.splice(index, 1);
  return true;
}

function hasConflict(roomId, startTime, endTime, excludeId = null) {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return bookings.some((b) => {
    if (b.roomId !== roomId) return false;
    if (excludeId && b.id === excludeId) return false;
    const bStart = new Date(b.startTime).getTime();
    const bEnd = new Date(b.endTime).getTime();
    return start < bEnd && end > bStart;
  });
}

module.exports = { getAll, getById, create, update, remove, hasConflict };
