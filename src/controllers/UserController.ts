import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { matchedData, validationResult } from 'express-validator';
import { Logger } from 'winston';
import createHttpError from 'http-errors';
import { UserQueryParams } from '../types';

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}
    async create(req: Request, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password, role } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: role,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });

        try {
            const [users, count] = await this.userService.getAll(
                validatedQuery as UserQueryParams,
            );
            this.logger.info('All users have been fetched');

            res.status(200).json({
                currentPage: validatedQuery.currentPage,
                perPage: validatedQuery.perPage,
                total: count,
                data: users,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param'));
            return;
        }

        try {
            const user = await this.userService.getById(Number(userId));
            if (!user) {
                next(createHttpError(400, "User doesn't exist"));
                return;
            }

            this.logger.info('User has been fetched');
            res.status(200).json(user);
        } catch (error) {
            next(error);
            return;
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, role } = req.body;
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.userService.update(Number(userId), {
                firstName,
                lastName,
                role,
            });
            res.json({ id: Number(userId) });
        } catch (error) {
            next(error);
            return;
        }
    }
    async destroy(req: Request, res: Response, next: NextFunction) {
        const userId = req.params.id;

        if (isNaN(Number(userId))) {
            next(createHttpError(400, 'Invalid url param.'));
            return;
        }

        try {
            await this.userService.deleteById(Number(userId));

            this.logger.info('User has been deleted', {
                id: Number(userId),
            });
            res.json({ id: Number(userId) });
        } catch (err) {
            next(err);
        }
    }
}
