import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

//You can use Functional Based here class based component bcoz grouping is possible easily
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
        // this.register = this.register.bind(this);
    }

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;

        // if (!email) {
        //     const error = createHttpError(400, 'Email is required');
        //     // throw error;
        //     next(error);
        // }
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '*********',
        });
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            this.logger.info('User has been registered successfully');
            res.status(201).json({ id: user?.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
