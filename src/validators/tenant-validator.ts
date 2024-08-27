import { body } from 'express-validator';

export default [
    body('name')
        .notEmpty()
        .withMessage('Please provide name of tenant')
        .isLength({ max: 100 })
        .withMessage('name length should be at most 100 characters!'),

    body('address')
        .notEmpty()
        .withMessage('Please provide address')
        .isLength({ max: 255 })
        .withMessage('address length should be at max 255 characters!'),
];
