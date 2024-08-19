import { Request, Response } from 'express';

//You can use Functional Based here class based component bcoz grouping is possible easily
export class AuthController {
    register(req: Request, res: Response) {
        res.status(201).json();
    }
}
