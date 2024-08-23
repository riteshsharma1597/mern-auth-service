import { body } from 'express-validator';

export default [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .trim()
        .isEmail()
        .withMessage('Please provide valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];
