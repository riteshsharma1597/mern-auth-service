import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Roles } from '../constants';
import { validationResult } from 'express-validator';

export class UserController {
    constructor(private userService: UserService) {}
    async create(req: Request, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { firstName, lastName, email, password } = req.body;
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role: Roles.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }
}
