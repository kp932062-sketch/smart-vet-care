const { body, param } = require('express-validator');

const registrationValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid numeric ID is required')
];

module.exports = {
  registrationValidation,
  idValidation
};
