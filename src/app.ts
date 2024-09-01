import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import tenantRouter from './routes/tenant';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user';
import cors from 'cors';

const app = express();

app.use(
    cors({
        //todo: move to .env file
        origin: ['http://localhost:5174'],
        credentials: true,
    }),
);
app.use(express.static('public'));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Welcome to Auth Service');
});

app.use(express.json());

app.use('/auth', authRouter);
app.use('/tenants', tenantRouter);
app.use('/users', userRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        errors: [{ type: err.name, msg: err.message, path: '', location: '' }],
    });
});

export default app;
