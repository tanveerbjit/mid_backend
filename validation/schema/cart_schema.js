const { body } = require("express-validator");

module.exports = [
    body('itemId')
    .isMongoId()
    .withMessage('Invalid itemId. Must be a valid MongoDB ObjectId.'),
    body('quantity')
    .isNumeric()
    .withMessage('Quantity must be a numeric value.'),
];
