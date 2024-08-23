import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import bcrypt from 'bcrypt';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { isJwt } from '../utils';

describe('POST /auth/login', () => {
    let connection: DataSource;
    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        //Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
        // await truncateTables(connection);
    });

    afterAll(async () => {
        await connection?.destroy();
    });
    describe('Given all fields', () => {
        it('should return the access token and refresh token inside a cookie', async () => {
            //AAA
            //Arrange
            const userData = {
                firstName: 'Ankush',
                lastName: 'Sharma',
                email: 'riteshbbn74@gmail.com',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });
            //Act
            const response = await request(app).post('/auth/login').send({
                email: userData.email,
                password: userData.password,
            });

            //Assert
            let accessToken = null;
            let refreshToken = null;

            const cookies = (response.headers['set-cookie'] || []) as string[];
            // eslint-disable-next-line no-console
            console.log(cookies);
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
        it('should return the 400 if email or password is wrong', async () => {
            // Arrange
            const userData = {
                firstName: 'ritesh',
                lastName: 'sharm',
                email: 'ankush@gmail.com',
                password: 'password',
            };

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const userRepository = connection.getRepository(User);
            await userRepository.save({
                ...userData,
                password: hashedPassword,
                role: Roles.CUSTOMER,
            });

            // Act
            const response = await request(app)
                .post('/auth/login')
                .send({ email: userData.email, password: 'wrongPassword' });

            // Assert

            expect(response.statusCode).toBe(400);
        });
    });
    describe('Fields are missing', () => {});
});
