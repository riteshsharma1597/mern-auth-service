import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';

//You can use Functional Based here class based component bcoz grouping is possible easily
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
    ) {
        this.userService = userService;
        this.tokenService = tokenService;
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

        // if (!firstName) {
        //     const error = createHttpError(400, 'First Name is required');
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            //Persist the refresh Token
            const MS_IN_YEAR = 100 * 60 * 60 * 24 * 365; //1y-> (Leap year)

            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEAR),
            });
            //Payload can be different
            //secret key must be strong , isko ham get karenge .env se
            // const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            //     algorithm: 'HS256',
            //     expiresIn: '1y',
            //     issuer: 'auth-service',
            //     jwtid: String(newRefreshToken.id),
            // });
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, //1h
                httpOnly: true, //very important
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, //1year
                httpOnly: true, //very important
            });

            res.status(201).json({ id: user?.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
