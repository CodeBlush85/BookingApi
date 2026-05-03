const { v4: uuidv4 } = require('uuid');

const rooms = [
  { id: uuidv4(), name: 'Conference Room A', capacity: 10, description: 'Large conference room with projector' },
  { id: uuidv4(), name: 'Meeting Room B', capacity: 4, description: 'Small meeting room' },
  { id: uuidv4(), name: 'Boardroom', capacity: 20, description: 'Executive boardroom with video conferencing' },
];

function getAll() {
  return [...rooms];
}

function getById(id) {
  return rooms.find((r) => r.id === id) || null;
}

function create(data) {
  const room = { id: uuidv4(), ...data };
  rooms.push(room);
  return room;
}

function update(id, data) {
  const index = rooms.findIndex((r) => r.id === id);
  if (index === -1) return null;
  rooms[index] = { ...rooms[index], ...data };
  return rooms[index];
}

function remove(id) {
  const index = rooms.findIndex((r) => r.id === id);
  if (index === -1) return false;
  rooms.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
