import express, { NextFunction, Request, Response } from 'express';
import authenticate from '../middlewares/authenticate';
import { canAcces } from '../middlewares/canAccess';
import { Roles } from '../constants';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post(
    '/',
    authenticate,
    canAcces([Roles.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req, res, next),
);
// router.patch(
//     '/:id',
//     authenticate,
//     canAcces([Roles.ADMIN]),
//     tenantValidator,
//     (req: Request, res: Response, next: NextFunction) =>
//         tenantController.update(req, res, next),
// );
// router.delete(
//     '/:id',
//     authenticate,
//     canAcces([Roles.ADMIN]),
//     (req: Request, res: Response, next: NextFunction) =>
//         tenantController.destroy(req, res, next),
// );

// router.get('/', (req: Request, res: Response, next: NextFunction) =>
//     tenantController.getAll(req, res, next),
// );

// router.get('/:id', (req: Request, res: Response, next: NextFunction) =>
//     tenantController.getOne(req, res, next),
// );

export default router;
