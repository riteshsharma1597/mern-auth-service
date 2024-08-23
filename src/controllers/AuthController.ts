import { NextFunction, Response } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';

//You can use Functional Based here class based component bcoz grouping is possible easily
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {
        //Automatically assigned that's why commented
        // this.userService = userService;
        // this.tokenService = tokenService;
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

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

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

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        //Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        const { email, password } = req.body;

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

        this.logger.debug('New request to Login a user', {
            email,
            password: '*********',
        });

        //Check if username(email) exists in database
        //Compare password
        //Generate tokens
        //Add tokens to Cookies
        //Return the response (id)

        try {
            const user = await this.userService.findByEmail(email);
            if (!user) {
                const error = createHttpError(
                    400,
                    'Email or Password does not match',
                );
                next(error);
                return;
            }

            //
            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    'Email or Password does not match',
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

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

            this.logger.info(
                `User has been logged in having userId ${user.id}`,
            );

            res.status(201).json({ id: user?.id });
        } catch (err) {
            next(err);
            return;
        }
    }
}
