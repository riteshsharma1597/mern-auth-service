import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';

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
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '*********',
        });
        console.log(req.body);
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
