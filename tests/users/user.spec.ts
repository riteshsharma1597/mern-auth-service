import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import createJWKSMOck from 'mock-jwks';

describe('GET /auth/self', () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMOck>;
    beforeAll(async () => {
        jwks = createJWKSMOck('http://localhost:5501');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        //Database truncate
        await connection.dropDatabase();
        await connection.synchronize();
        // await truncateTables(connection);
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection?.destroy();
    });
    describe('Given all fields', () => {
        it('should return the 200 status code', async () => {
            //Generate token
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.CUSTOMER,
            });
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            expect(response.statusCode).toBe(200);
        });

        it('should return the user data', async () => {
            const userData = {
                firstName: 'Ritesh',
                lastName: 'Sharma',
                email: 'riteshbbn74@gmail.com',
                password: 'password',
            };
            //Register user
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({
                ...userData,
                role: Roles.CUSTOMER,
            });

            //Generate token
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });
            //Add token to cookie

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', [`accessToken=${accessToken}`])
                .send();
            //Assert
            //Check if user id matches with registered user
            expect(response.body.id).toBe(data.id);
        });
    });
});
