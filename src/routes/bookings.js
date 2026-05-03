const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/bookingsController');

const bookingValidation = [
  body('roomId').notEmpty().withMessage('roomId is required'),
  body('title').notEmpty().withMessage('title is required'),
  body('startTime').isISO8601().withMessage('startTime must be a valid ISO 8601 date'),
  body('endTime').isISO8601().withMessage('endTime must be a valid ISO 8601 date'),
  body('bookedBy').notEmpty().withMessage('bookedBy is required'),
];

router.get('/', ctrl.listBookings);
router.get('/:id', ctrl.getBooking);
router.post('/', bookingValidation, validate, ctrl.createBooking);
router.put('/:id', [
  body('roomId').optional().notEmpty().withMessage('roomId cannot be empty'),
  body('title').optional().notEmpty().withMessage('title cannot be empty'),
  body('startTime').optional().isISO8601().withMessage('startTime must be a valid ISO 8601 date'),
  body('endTime').optional().isISO8601().withMessage('endTime must be a valid ISO 8601 date'),
  body('bookedBy').optional().notEmpty().withMessage('bookedBy cannot be empty'),
], validate, ctrl.updateBooking);
router.delete('/:id', ctrl.deleteBooking);

module.exports = router;
