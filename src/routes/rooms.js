const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/roomsController');

const roomValidation = [
  body('name').notEmpty().withMessage('name is required'),
  body('capacity').isInt({ min: 1 }).withMessage('capacity must be a positive integer'),
];

router.get('/', ctrl.listRooms);
router.get('/:id', ctrl.getRoom);
router.post('/', roomValidation, validate, ctrl.createRoom);
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('name cannot be empty'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('capacity must be a positive integer'),
], validate, ctrl.updateRoom);
router.delete('/:id', ctrl.deleteRoom);

module.exports = router;
