import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import createJWKSMOck from 'mock-jwks';

describe('POST /users', () => {
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
        it('should create a manager user', async () => {
            //Arrange
            const userData = {
                firstName: 'Ritesh',
                lastName: 'Sharma',
                email: 'riteshbbn74+100@gmail.com',
                password: 'password',
                tenantId: 1,
                role: Roles.MANAGER,
            };

            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });
            //Act

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(Roles.MANAGER);
        });
        it('should persist the user in database', async () => {
            //Arrange
            const userData = {
                firstName: 'Ritesh',
                lastName: 'Sharma',
                email: 'riteshbbn74@gmail.com',
                password: 'password',
                tenantId: 1,
                role: Roles.MANAGER,
            };

            const adminToken = jwks.token({
                sub: '1',
                role: Roles.ADMIN,
            });
            //Act

            await request(app)
                .post('/users')
                .set('Cookie', [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });
        it.todo('should return 403 if non admin user tries to create a user');
    });
});
