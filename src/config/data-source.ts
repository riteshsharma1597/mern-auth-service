import 'reflect-metadata';
import { User } from '../entity/User';
import { DataSource } from 'typeorm';
import { Config } from '.';
import { RefreshToken } from '../entity/RefreshToken';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: String(Config.DB_PASSWORD),
    database: Config.DB_NAME,
    //Don't use this in production, Always keep false

    // synchronize: Config.NODE_ENV === 'test' || Config.NODE_ENV === 'dev',
    synchronize: false,
    logging: false,
    entities: [User, RefreshToken],
    migrations: [],
    subscribers: [],
});
