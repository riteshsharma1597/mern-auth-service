import { Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';

//You can use Functional Based here class based component bcoz grouping is possible easily
export class AuthController {
    constructor(private userService: UserService) {
        this.userService = userService;
        this.register = this.register.bind(this);
    }

    async register(req: RegisterUserRequest, res: Response) {
        console.log(req.body);
        const { firstName, lastName, email, password } = req.body;
        await this?.userService.create({
            firstName,
            lastName,
            email,
            password,
        });
        res.status(201).json();
    }
}
